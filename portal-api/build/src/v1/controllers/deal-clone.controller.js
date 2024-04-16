"use strict";
const tslib_1 = require("tslib");
const DEFAULTS = require('../defaults');
const { findLatestMandatoryCriteria } = require('./mandatoryCriteria.controller');
const { findOneDeal, createDeal, createDealEligibility } = require('./deal.controller');
const { getCloneDealErrors } = require('../validation/clone-bss-deal');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');
const CLONE_BOND_FIELDS = [
    'type',
    'facilityStage',
    'requestedCoverStartDate',
    'coverEndDate-day',
    'coverEndDate-month',
    'coverEndDate-year',
    'value',
    'currencySameAsSupplyContractCurrency',
    'currency',
    'conversionRate',
    'conversionRateDate-day',
    'conversionRateDate-month',
    'conversionRateDate-year',
    'name',
    'ukefGuaranteeInMonths',
];
const CLONE_LOAN_FIELDS = [
    'type',
    'name',
    'value',
    'currency',
    'currencySameAsSupplyContractCurrency',
    'conversionRate',
    'conversionRateDate-day',
    'conversionRateDate-month',
    'conversionRateDate-year',
    'disbursementAmount',
    'requestedCoverStartDate',
    'coverEndDate-day',
    'coverEndDate-month',
    'coverEndDate-year',
    'ukefGuaranteeInMonths',
];
const stripTransaction = (transaction, allowedFields) => {
    const stripped = {};
    Object.keys(transaction).forEach((key) => {
        if (allowedFields.includes(key)) {
            stripped[key] = transaction[key];
        }
    });
    return stripped;
};
exports.clone = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield findOneDeal(req.params.id, (existingDeal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!existingDeal) {
            return res.status(404).send();
        }
        const { bankInternalRefName, additionalRefName, cloneTransactions } = req.body;
        const { _id, previousStatus, tfm } = existingDeal, existingDealWithoutCertainFields = tslib_1.__rest(existingDeal, ["_id", "previousStatus", "tfm"]);
        delete existingDealWithoutCertainFields.dataMigration;
        if ((_a = existingDealWithoutCertainFields === null || existingDealWithoutCertainFields === void 0 ? void 0 : existingDealWithoutCertainFields.submissionDetails) === null || _a === void 0 ? void 0 : _a.v1Status) {
            delete existingDealWithoutCertainFields.submissionDetails.v1Status;
        }
        if (existingDealWithoutCertainFields.submissionType) {
            delete existingDealWithoutCertainFields.submissionType;
        }
        const modifiedDeal = Object.assign(Object.assign({}, existingDealWithoutCertainFields), { status: DEFAULTS.DEAL.status, updatedAt: existingDeal.updatedAt, bankInternalRefName,
            additionalRefName, bank: existingDeal.bank, details: {
                maker: req.user,
            }, mandatoryCriteria: yield findLatestMandatoryCriteria(), eligibility: yield createDealEligibility(), editedBy: [], comments: [], ukefComments: [], ukefDecision: [], bondTransactions: DEFAULTS.DEAL.bondTransactions, loanTransactions: DEFAULTS.DEAL.loanTransactions, facilities: DEFAULTS.DEAL.facilities, supportingInformation: {}, clonedDealId: existingDeal._id });
        if (modifiedDeal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN) {
            modifiedDeal.submissionType = CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
        }
        const validationErrors = getCloneDealErrors(modifiedDeal, cloneTransactions);
        if (validationErrors) {
            return res.status(400).send(Object.assign(Object.assign({}, modifiedDeal), { validationErrors }));
        }
        const { data: createdDeal } = yield createDeal(modifiedDeal, req.user);
        const createdDealId = createdDeal._id;
        if (cloneTransactions === 'true') {
            const hasBonds = existingDeal.bondTransactions.items.length > 0;
            const hasLoans = existingDeal.loanTransactions.items.length > 0;
            if (hasBonds || hasLoans) {
                const facilities = [...existingDeal.bondTransactions.items, ...existingDeal.loanTransactions.items];
                const strippedFacilities = facilities.map((facility) => {
                    if (facility.type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
                        return stripTransaction(facility, CLONE_BOND_FIELDS);
                    }
                    if (facility.type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN) {
                        return stripTransaction(facility, CLONE_LOAN_FIELDS);
                    }
                    return facility;
                });
                yield facilitiesController.createMultipleFacilities(strippedFacilities, createdDealId, req.user);
            }
        }
        return res.status(200).send(createdDeal);
    }));
});
