"use strict";
const tslib_1 = require("tslib");
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const facilityChangeCoverStartDateValidationErrors = require('../validation/facility-change-cover-start-date');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate, } = require('../facility-dates/requested-cover-start-date');
const CONSTANTS = require('../../constants');
const facilitiesController = require('./facilities.controller');
exports.updateLoanCoverStartDate = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId, loanId, } = req.params;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                return res.status(401).send();
            }
            const existingLoan = yield facilitiesController.findOne(loanId);
            if (!existingLoan) {
                return res.status(404).send();
            }
            if (existingLoan.facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) {
                return res.status(400).send();
            }
            let modifiedLoan = Object.assign(Object.assign({}, existingLoan), req.body);
            if (hasAllRequestedCoverStartDateValues(modifiedLoan)) {
                modifiedLoan = updateRequestedCoverStartDate(modifiedLoan);
            }
            const validationErrors = facilityChangeCoverStartDateValidationErrors(modifiedLoan, deal);
            if (validationErrors.errorList
                && validationErrors.errorList.requestedCoverStartDate) {
                return res.status(400).send({
                    validationErrors,
                    loan: modifiedLoan,
                });
            }
            const { status, data } = yield facilitiesController.update(dealId, loanId, modifiedLoan, req.user);
            return res.status(status).send(data);
        }
        return res.status(404).send();
    }));
});
