"use strict";
const tslib_1 = require("tslib");
const { findOneDeal, update: updateDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { getEligibilityErrors, getCriteria11Errors, getEligibilityStatus } = require('../validation/eligibility-criteria');
const { getDocumentationErrors } = require('../validation/eligibility-documentation');
const CONSTANTS = require('../../constants');
const { getCountry } = require('./countries.controller');
/**
 * Retrieves the country object encompassing `name` and `code` for a specified country code.
 * Returns `{}` when either the country code specified is void or upon an unexpected response.
 *
 * @param {string} countryCode - The country code.
 * @returns {Promise<Object>} - The country object with properties 'name' and 'code' returned as a promise.
 */
const countryObject = (countryCode) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!countryCode) {
        console.error('Invalid country code specified %s', countryCode);
        return {};
    }
    const response = yield getCountry(countryCode);
    if (!(response === null || response === void 0 ? void 0 : response.data)) {
        console.error('Unexpected response received whilst fetching country with code %o', response);
        return {};
    }
    const { data: country } = response;
    if (!country) {
        return {};
    }
    const { name, code } = country;
    return {
        name,
        code,
    };
});
exports.update = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield findOneDeal(req.params.id, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (!deal) {
            res.status(404).send();
        }
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                res.status(401).send();
            }
            const { eligibility: { criteria }, supportingInformation = {}, } = deal;
            let criteriaComplete = true;
            let criteriaAllTrue = true;
            const updatedCriteria = criteria.map((c) => {
                if (typeof req.body[`criterion-${c.id}`] === 'undefined') {
                    criteriaAllTrue = false;
                    criteriaComplete = false;
                    return c;
                }
                criteriaAllTrue = criteriaAllTrue && req.body[`criterion-${c.id}`].toLowerCase() === 'true';
                return Object.assign(Object.assign({}, c), { answer: req.body[`criterion-${c.id}`].toLowerCase() === 'true' });
            });
            const submissionTypeComplete = criteriaComplete ? CONSTANTS.DEAL.SUBMISSION_TYPE.MIA : '';
            const submissionType = criteriaAllTrue ? CONSTANTS.DEAL.SUBMISSION_TYPE.AIN : submissionTypeComplete;
            const validationErrors = getEligibilityErrors(updatedCriteria);
            const documentationErrors = getDocumentationErrors(submissionType, supportingInformation);
            // Special case for criteria 11 - must add agents name & address if criteria 11 === false
            const criteria11 = updatedCriteria.find((c) => c.id === 11);
            const criteria11IsFalse = typeof criteria11.answer !== 'undefined' && criteria11.answer === false;
            const criteria11Additional = {
                agentName: criteria11IsFalse && req.body.agentName ? req.body.agentName.substring(0, 150) : '',
                agentAddressCountry: criteria11IsFalse ? yield countryObject(req.body.agentAddressCountry) : '',
                agentAddressLine1: criteria11IsFalse ? req.body.agentAddressLine1 : '',
                agentAddressLine2: criteria11IsFalse ? req.body.agentAddressLine2 : '',
                agentAddressLine3: criteria11IsFalse ? req.body.agentAddressLine3 : '',
                agentAddressTown: criteria11IsFalse ? req.body.agentAddressTown : '',
                agentAddressPostcode: criteria11IsFalse ? req.body.agentAddressPostcode : '',
            };
            const criteria11ValidationErrors = getCriteria11Errors(criteria11Additional, criteria11IsFalse);
            validationErrors.count += criteria11ValidationErrors.count;
            validationErrors.errorList = Object.assign(Object.assign({}, criteria11ValidationErrors.errorList), validationErrors.errorList);
            const status = getEligibilityStatus({
                criteriaComplete,
                ecErrorCount: validationErrors.count,
                dealFilesErrorCount: documentationErrors.validationErrors.count,
            });
            const updatedDeal = Object.assign(Object.assign({}, deal), { submissionType, details: Object.assign({}, deal.details), eligibility: Object.assign(Object.assign({ status, criteria: updatedCriteria }, criteria11Additional), { validationErrors, lastUpdated: new Date().valueOf() }), supportingInformation: Object.assign(Object.assign({}, supportingInformation), { validationErrors: documentationErrors.validationErrors }) });
            const newReq = {
                params: req.params,
                body: updatedDeal,
                user: req.user,
            };
            updateDeal(newReq, res);
        }
    }));
});
