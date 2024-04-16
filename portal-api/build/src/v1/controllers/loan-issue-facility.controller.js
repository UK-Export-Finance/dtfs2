"use strict";
const tslib_1 = require("tslib");
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate, } = require('../facility-dates/requested-cover-start-date');
const { hasAllIssuedDateValues } = require('../facility-dates/issued-date');
const { getStartOfDateFromDayMonthYearStrings } = require("../helpers/date");
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const { hasValue } = require('../../utils/string');
const canIssueFacility = require('../facility-issuance');
const facilitiesController = require('./facilities.controller');
const CONSTANTS = require('../../constants');
exports.updateLoanIssueFacility = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId, loanId, } = req.params;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                return res.status(401).send();
            }
            const loan = yield facilitiesController.findOne(loanId);
            if (!loan) {
                return res.status(404).send();
            }
            if (!canIssueFacility(req.user.roles, deal, loan)) {
                return res.status(403).send();
            }
            let modifiedLoan = Object.assign(Object.assign({}, loan), req.body);
            // remove status added via type B XML. (we dynamically generate statuses)
            modifiedLoan.status = null;
            if (!modifiedLoan.issueFacilityDetailsStarted
                && !modifiedLoan.issueFacilityDetailsSubmitted) {
                // add a flag for UI/design/status/business handling...
                modifiedLoan.issueFacilityDetailsStarted = true;
            }
            const loanHasName = hasValue(loan.name);
            if (!loanHasName) {
                modifiedLoan.nameRequiredForIssuance = true;
            }
            if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
                modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
            }
            else {
                modifiedLoan.requestedCoverStartDate = null;
            }
            if (hasAllIssuedDateValues(modifiedLoan)) {
                modifiedLoan.issuedDate = getStartOfDateFromDayMonthYearStrings(req.body['issuedDate-day'], req.body['issuedDate-month'], req.body['issuedDate-year']).valueOf().toString();
            }
            else {
                modifiedLoan.issuedDate = null;
            }
            const validationErrors = loanIssueFacilityValidationErrors(modifiedLoan, deal);
            modifiedLoan.hasBeenIssued = false;
            modifiedLoan.issueFacilityDetailsProvided = false;
            if (validationErrors.count === 0) {
                modifiedLoan.issueFacilityDetailsProvided = true;
                modifiedLoan.hasBeenIssued = true;
                modifiedLoan.previousFacilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL;
                modifiedLoan.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL;
            }
            const { status, data } = yield facilitiesController.update(dealId, loanId, modifiedLoan, req.user);
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
