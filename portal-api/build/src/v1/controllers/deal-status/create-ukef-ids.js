"use strict";
const tslib_1 = require("tslib");
const { number } = require('../../../external-api/api');
const { updateDeal } = require('../deal.controller');
const facilitiesController = require('../facilities.controller');
const { NUMBER } = require('../../../constants');
/**
 * Generates and updates UKEF IDs for a given deal and its facilities.
 * @param {object} deal - An object representing the deal, including its ID and facilities.
 * @param {object} user - An object representing the user performing the operation.
 * @returns {Promise<object>} - The updated deal object with UKEF IDs for the deal and its facilities.
 * @throws {Error} - If unable to get UKEF IDs from the number generator.
 */
const createUkefIds = (deal, user) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(deal === null || deal === void 0 ? void 0 : deal._id) || !(user === null || user === void 0 ? void 0 : user._id)) {
            throw new Error('Invalid argument provided');
        }
        const facilitiesUpdatePromises = [];
        const { _id: dealId } = deal;
        // Get the deal number
        const { data: dealNumber } = yield number.getNumber(NUMBER.ENTITY_TYPE.DEAL, dealId);
        // Update the deal object with the obtained deal number
        const updatedDeal = yield updateDeal(dealId, {
            details: {
                ukefDealId: dealNumber.data[0].maskedId,
            },
        }, user);
        // Generate and update UKEF IDs for each facility in the deal's facilities array
        for (const facilityId of deal.facilities) {
            // Get the facility number
            const { data: facilityNumber } = yield number.getNumber(NUMBER.ENTITY_TYPE.FACILITY, deal._id);
            const modifiedFacility = {
                ukefFacilityId: facilityNumber.data[0].maskedId,
            };
            // Push the updated facilities promises in an array
            facilitiesUpdatePromises.push(facilitiesController.update(deal._id, facilityId, modifiedFacility, user));
        }
        // Wait for all the promises in the array to resolve
        yield Promise.all(facilitiesUpdatePromises);
        return updatedDeal;
    }
    catch (error) {
        console.error('❌ Unable to get UKEF IDs from the number generator %o', error);
        throw new Error('Unable to get UKEF IDs from the number generator', { cause: error });
    }
});
module.exports = createUkefIds;
