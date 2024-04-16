"use strict";
const tslib_1 = require("tslib");
const { isValidMongoId } = require('../validation/validateIds');
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const loanValidationErrors = require('../validation/loan');
const { calculateGuaranteeFee, calculateUkefExposure, } = require('../section-calculations');
const { handleTransactionCurrencyFields } = require('../section-currency');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate, } = require('../facility-dates/requested-cover-start-date');
const { hasAllCoverEndDateValues, updateCoverEndDate, } = require('../facility-dates/cover-end-date');
const { loanStatus } = require('../section-status/loans');
const { sanitizeCurrency } = require('../../utils/number');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');
exports.create = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!isValidMongoId((_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.id)) {
        console.error('Create loans API failed for deal id %s', req.params.id);
        return res.status(400).send({ status: 400, message: 'Invalid id provided' });
    }
    return findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal)
            return res.status(404).send();
        if (!userHasAccessTo(req.user, deal)) {
            return res.status(401).send();
        }
        const facilityBody = Object.assign({ type: 'Loan', dealId: req.params.id }, req.body);
        const { status, data } = yield facilitiesController.create(facilityBody, req.user);
        return res.status(status).send(Object.assign(Object.assign({}, data), { loanId: data._id }));
    }));
});
exports.getLoan = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { id: dealId, loanId, } = req.params;
    if (!isValidMongoId((_b = req === null || req === void 0 ? void 0 : req.params) === null || _b === void 0 ? void 0 : _b.id) || !isValidMongoId((_c = req === null || req === void 0 ? void 0 : req.params) === null || _c === void 0 ? void 0 : _c.loanId)) {
        console.error('Get loan API failed for deal/loan id %s', req.params.id, req.params.loanId);
        return res.status(400).send({ status: 400, message: 'Invalid id provided' });
    }
    return findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                res.status(401).send();
            }
            const loan = yield facilitiesController.findOne(loanId);
            if (loan) {
                const validationErrors = loanValidationErrors(loan, deal);
                return res.json({
                    dealId,
                    loan: Object.assign(Object.assign({}, loan), { status: loanStatus(loan, validationErrors) }),
                    validationErrors,
                });
            }
            return res.status(404).send();
        }
        return res.status(404).send();
    }));
});
const facilityStageFields = (loan) => {
    const modifiedLoan = loan;
    const { facilityStage } = modifiedLoan;
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL) {
        // remove any 'Unconditional' specific fields
        modifiedLoan.requestedCoverStartDate = null;
        modifiedLoan['requestedCoverStartDate-day'] = null;
        modifiedLoan['requestedCoverStartDate-month'] = null;
        modifiedLoan['requestedCoverStartDate-year'] = null;
        modifiedLoan['coverEndDate-day'] = null;
        modifiedLoan['coverEndDate-month'] = null;
        modifiedLoan['coverEndDate-year'] = null;
        modifiedLoan.disbursementAmount = null;
        modifiedLoan.hasBeenIssued = false;
    }
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) {
        // remove any 'Conditional' specific fields
        modifiedLoan.ukefGuaranteeInMonths = null;
        modifiedLoan.hasBeenIssued = true;
    }
    return modifiedLoan;
};
const premiumTypeFields = (loan) => {
    const modifiedLoan = loan;
    const { premiumType } = modifiedLoan;
    if (premiumType === 'At maturity') {
        modifiedLoan.premiumFrequency = null;
    }
    return modifiedLoan;
};
exports.updateLoan = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId, loanId, } = req.params;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                res.status(401).send();
            }
            const existingLoan = yield facilitiesController.findOne(loanId);
            if (!existingLoan) {
                return res.status(404).send();
            }
            let modifiedLoan = Object.assign(Object.assign({}, existingLoan), req.body);
            modifiedLoan = facilityStageFields(modifiedLoan);
            modifiedLoan = yield handleTransactionCurrencyFields(modifiedLoan, deal);
            modifiedLoan = premiumTypeFields(modifiedLoan);
            const { value, coveredPercentage, interestMarginFee } = modifiedLoan;
            const sanitizedFacilityValue = sanitizeCurrency(value);
            modifiedLoan.guaranteeFeePayableByBank = calculateGuaranteeFee(interestMarginFee);
            if (sanitizedFacilityValue.sanitizedValue) {
                modifiedLoan.ukefExposure = calculateUkefExposure(sanitizedFacilityValue.sanitizedValue, coveredPercentage);
                modifiedLoan.value = sanitizedFacilityValue.sanitizedValue;
            }
            if (modifiedLoan.disbursementAmount) {
                const sanitizedFacilityDisbursement = sanitizeCurrency(modifiedLoan.disbursementAmount);
                if (sanitizedFacilityDisbursement.sanitizedValue) {
                    modifiedLoan.disbursementAmount = sanitizedFacilityDisbursement.sanitizedValue;
                }
            }
            if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
                modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
            }
            else {
                modifiedLoan.requestedCoverStartDate = null;
            }
            if (hasAllCoverEndDateValues(modifiedLoan)) {
                modifiedLoan = updateCoverEndDate(modifiedLoan);
            }
            else {
                modifiedLoan.coverEndDate = null;
            }
            const { status, data } = yield facilitiesController.update(dealId, loanId, modifiedLoan, req.user);
            const validationErrors = loanValidationErrors(data, deal);
            if (validationErrors.count !== 0) {
                return res.status(400).send({
                    validationErrors,
                    loan: data,
                });
            }
            return res.status(status).send(data);
        }
        return res.status(404).send();
    }));
});
exports.deleteLoan = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { loanId, } = req.params;
    yield findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                return res.status(401).send();
            }
            const { status, data } = yield facilitiesController.delete(loanId, req.user);
            return res.status(status).send(data);
        }
        return res.status(404).send();
    }));
});
