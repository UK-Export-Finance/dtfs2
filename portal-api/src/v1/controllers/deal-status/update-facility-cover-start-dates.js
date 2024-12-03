const CONSTANTS = require('../../../constants');
const { getNowAsEpoch } = require('../../helpers/date');
const facilitiesController = require('../facilities.controller');

/**
 * Updates the cover start dates of facilities in a deal.
 * @param {Object} user - The user object representing the user performing the update.
 * @param {Object} deal - The deal object containing the facilities to be updated.
 * @param {import("@ukef/dtfs2-common").AuditDetails} auditDetails - user making the request
 * @returns {Promise<Object>} - The modified deal object with updated facility cover start dates.
 */
const updateFacilityCoverStartDates = async (user, deal, auditDetails) => {
  try {
    const modifiedDeal = { ...deal };

    if (!modifiedDeal.facilities || !modifiedDeal.facilities?.length) {
      console.error('No facilities found in deal %s', modifiedDeal._id);
      throw new Error(`No facilities found in deal ${modifiedDeal._id}`);
    }

    for (const facilityId of modifiedDeal.facilities) {
      const facility = await facilitiesController.findOne(facilityId);
      const { facilityStage } = facility;
      const canUpdate =
        (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED || facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL) &&
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

        const { data } = await facilitiesController.update(deal._id, facilityId, facility, user, auditDetails);

        if (!data) {
          console.error('Error updating facility cover start date for facility %s with response %o', facilityId, data);
        }
      }
    }

    return modifiedDeal;
  } catch (error) {
    console.error("An error occurred while updating %s deal's facilities cover start date %o", deal._id, error);
    return deal;
  }
};

module.exports = updateFacilityCoverStartDates;
