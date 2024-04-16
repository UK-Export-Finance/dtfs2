"use strict";
const tslib_1 = require("tslib");
const { findOneDeal } = require('./deal.controller');
const { userHasAccessTo } = require('../users/checks');
const facilityChangeCoverStartDateValidationErrors = require('../validation/facility-change-cover-start-date');
const { hasAllRequestedCoverStartDateValues, updateRequestedCoverStartDate, } = require('../facility-dates/requested-cover-start-date');
const CONSTANTS = require('../../constants');
const facilitiesController = require('./facilities.controller');
exports.updateBondCoverStartDate = (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { id: dealId, bondId, } = req.params;
    yield findOneDeal(dealId, (deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (deal) {
            if (!userHasAccessTo(req.user, deal)) {
                return res.status(401).send();
            }
            const existingBond = yield facilitiesController.findOne(bondId);
            if (!existingBond) {
                return res.status(404).send();
            }
            if (existingBond.facilityStage !== CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED) {
                return res.status(400).send();
            }
            let modifiedBond = Object.assign(Object.assign({}, existingBond), req.body);
            if (hasAllRequestedCoverStartDateValues(modifiedBond)) {
                modifiedBond = updateRequestedCoverStartDate(modifiedBond);
            }
            const validationErrors = facilityChangeCoverStartDateValidationErrors(modifiedBond, deal);
            if (validationErrors.errorList
                && validationErrors.errorList.requestedCoverStartDate) {
                return res.status(400).send({
                    validationErrors,
                    bond: modifiedBond,
                });
            }
            const { status, data } = yield facilitiesController.update(dealId, bondId, modifiedBond, req.user);
            return res.status(status).send(data);
        }
        return res.status(404).send();
    }));
});
