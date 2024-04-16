"use strict";
const tslib_1 = require("tslib");
const CONSTANTS = require('../../../constants');
const { getNowAsEpoch } = require('../../helpers/date');
const facilitiesController = require('../facilities.controller');
/**
 * Updates the cover start dates of facilities in a deal.
 * @param {object} user - The user object representing the user performing the update.
 * @param {object} deal - The deal object containing the facilities to be updated.
 * @returns {object} - The modified deal object with updated facility cover start dates.
 */
const updateFacilityCoverStartDates = (user, deal) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const modifiedDeal = Object.assign({}, deal);
        if (!modifiedDeal.facilities || !((_a = modifiedDeal.facilities) === null || _a === void 0 ? void 0 : _a.length)) {
            console.error('No facilities found in deal %s', modifiedDeal._id);
            throw new Error(`No facilities found in deal ${modifiedDeal._id}`);
        }
        for (const facilityId of modifiedDeal.facilities) {
            const facility = yield facilitiesController.findOne(facilityId);
            const { facilityStage } = facility;
            const canUpdate = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED || facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) &&
                !facility.requestedCoverStartDate &&
                !facility.coverDateConfirmed;
            if (canUpdate) {
                console.info('⚡ Updating facility %s cover start date', facilityId);
                const today = new Date();
                const nowAsEpoch = getNowAsEpoch();
                facility.updatedAt = nowAsEpoch;
                facility.coverDateConfirmed = true;
                facility.requestedCoverStartDate = nowAsEpoch;
                facility['requestedCoverStartDate-day'] = today.getDate();
                facility['requestedCoverStartDate-month'] = today.getMonth() + 1;
                facility['requestedCoverStartDate-year'] = today.getFullYear();
                const { data } = yield facilitiesController.update(deal._id, facilityId, facility, user);
                if (!data) {
                    console.error('Error updating facility cover start date for facility %s with response %o', facilityId, data);
                }
            }
        }
        return modifiedDeal;
    }
    catch (error) {
        console.error("An error occurred while updating %s deal's facilities cover start date %o", deal._id, error);
        return deal;
    }
});
module.exports = updateFacilityCoverStartDates;
