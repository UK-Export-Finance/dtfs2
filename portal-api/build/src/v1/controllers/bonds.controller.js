"use strict";
const tslib_1 = require("tslib");
const { isValidMongoId } = require('../validation/validateIds');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const bondValidationErrors = require('../validation/bond');
const { bondStatus } = require('../section-status/bonds');
const { calculateGuaranteeFee, calculateUkefExposure, } = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate, } = require('../facility-dates/requested-cover-start-date');
const { hasAllCoverEndDateValues, updateCoverEndDate, } = require('../facility-dates/cover-end-date');
const { sanitizeCurrency } = require('../../utils/number');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!isValidMongoId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id)) {
        console.error('Create bond API failed for deal id %s', req.params.id);
        return res.status(400).send({ status: 400, message: 'Invalid id provided' });
    }
    return findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal)
            return res.status(404).send();
        if (!userHasAccessTo(req.user, deal)) {
            return res.status(401).send();
        }
        const facilityBody = Object.assign({ type: 'Bond', dealId: req.params.id }, req.body);
        const { status, data } = yield facilitiesController.create(facilityBody, req.user);
        return res.status(status).send(Object.assign(Object.assign({}, data), { bondId: data._id }));
    }));
});
exports.getBond = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { id: dealId, bondId, } = req.params;
    if (!isValidMongoId((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.id) || !isValidMongoId((_c = req === null || req === void 0 ? void 0 : req.params) === null || _c === void 0 ? void 0 : _c.bondId)) {
        console.error('Get bond API failed for deal/bond id %s', req.params.id, req.params.loanId);
        return res.status(400).send({ status: 400, message: 'Invalid deal or bond id provided' });
    }
    return findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                return res.status(401).send();
            }
            const bond = yield facilitiesController.findOne(bondId);
            if (bond) {
                const validationErrors = bondValidationErrors(bond, deal);
                return res.json({
                    dealId,
                    bond: Object.assign(Object.assign({}, bond), { status: bondStatus(bond, validationErrors) }),
                    validationErrors,
                });
            }
            return res.status(404).send();
        }
        return res.status(404).send();
    }));
});
const facilityStageFields = (bond) => {
    const modifiedBond = bond;
    const { facilityStage } = modifiedBond;
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED) {
        // remove any `Unissued Facility Stage` specific fields/values
        modifiedBond.ukefGuaranteeInMonths = null;
        modifiedBond.hasBeenIssued = true;
    }
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED) {
        // remove any `Issued Facility Stage` specific fields/values
        modifiedBond.requestedCoverStartDate = null;
        modifiedBond['requestedCoverStartDate-day'] = null;
        modifiedBond['requestedCoverStartDate-month'] = null;
        modifiedBond['requestedCoverStartDate-year'] = null;
        modifiedBond['coverEndDate-day'] = null;
        modifiedBond['coverEndDate-month'] = null;
        modifiedBond['coverEndDate-year'] = null;
        modifiedBond.name = null;
        modifiedBond.hasBeenIssued = false;
    }
    return modifiedBond;
};
const feeTypeFields = (bond) => {
    const modifiedBond = bond;
    const { feeType } = modifiedBond;
    if (feeType === 'At maturity') {
        modifiedBond.feeFrequency = null;
    }
    return modifiedBond;
};
exports.updateBond = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId, bondId, } = req.params;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                res.status(401).send();
            }
            const existingBond = yield facilitiesController.findOne(bondId);
            if (!existingBond) {
                return res.status(404).send();
            }
            let modifiedBond = Object.assign(Object.assign({}, existingBond), req.body);
            modifiedBond = facilityStageFields(modifiedBond);
            modifiedBond = yield handleTransactionCurrencyFields(modifiedBond, deal);
            modifiedBond = feeTypeFields(modifiedBond);
            const { value, coveredPercentage, riskMarginFee } = modifiedBond;
            const sanitizedFacilityValue = sanitizeCurrency(value);
            modifiedBond.guaranteeFeePayableByBank = calculateGuaranteeFee(riskMarginFee);
            if (sanitizedFacilityValue.sanitizedValue) {
                modifiedBond.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);
                modifiedBond.value = sanitizedFacilityValue.sanitizedValue;
            }
            if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
                modifiedBond = updateRequestedCoverStartDate(modifiedBond);
            }
            else {
                modifiedBond.requestedCoverStartDate = null;
            }
            if (hasAllCoverEndDateValues(modifiedBond)) {
                modifiedBond = updateCoverEndDate(modifiedBond);
            }
            else {
                modifiedBond.coverEndDate = null;
            }
            const { status, data } = yield facilitiesController.update(dealId, bondId, modifiedBond, req.user);
            const validationErrors = bondValidationErrors(data, deal);
            if (validationErrors.count !== 0) {
                return res.status(400).send({
                    validationErrors,
                    bond: data,
                });
            }
            return res.status(status).send(data);
        }
        return res.status(404).send();
    }));
});
exports.deleteBond = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { bondId, } = req.params;
    yield findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                return res.status(401).send();
            }
            const { status, data } = yield facilitiesController.delete(bondId, req.user);
            return res.status(status).send(data);
        }
        return res.status(404).send();
    }));
});
