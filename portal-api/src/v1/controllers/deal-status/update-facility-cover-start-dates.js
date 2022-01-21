const now = require('../../../now');
const CONSTANTS = require('../../../constants');
const facilitiesController = require('../facilities.controller');

const updateFacilityCoverStartDates = async (user, deal) => {
  const modifiedDeal = deal;

  if (modifiedDeal.facilities.length) {
    modifiedDeal.facilities.forEach(async (facilityId) => {
      const facility = await facilitiesController.findOne(facilityId);

      const { facilityStage } = facility;

      const shouldUpdate = ((facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
                            || facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL)
                            && !facility.requestedCoverStartDate);

      if (shouldUpdate) {
        const today = new Date();

        facility.updatedAt = now();
        facility.requestedCoverStartDate = now();
        facility['requestedCoverStartDate-day'] = today.getDate();
        facility['requestedCoverStartDate-month'] = today.getMonth() + 1;
        facility['requestedCoverStartDate-year'] = today.getFullYear();

        const { data } = await facilitiesController.update(
          deal._id,
          facilityId,
          facility,
          user,
        );
        return data;
      }
      return facility;
    });
  }

  return deal;
};

module.exports = updateFacilityCoverStartDates;
