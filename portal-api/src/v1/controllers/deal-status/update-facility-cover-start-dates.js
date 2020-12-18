const { updateDeal } = require('../deal.controller');
const now = require('../../../now');
const CONSTANTS = require('../../../constants');

const updateFacilityCoverStartDates = async (user, deal) => {
  const facilities = {
    bonds: deal.bondTransactions.items,
    loans: deal.loanTransactions.items,
  };

  const updateFacilities = (arr) => {
    arr.forEach((f) => {
      const facility = f;

      const { facilityStage } = facility;

      const shouldUpdate = ((facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
                           || facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL)
                           && !facility.requestedCoverStartDate);

      if (shouldUpdate) {
        const today = new Date();

        facility.lastEdited = now();
        facility.requestedCoverStartDate = now();
        facility['requestedCoverStartDate-day'] = today.getDate();
        facility['requestedCoverStartDate-month'] = today.getMonth() + 1;
        facility['requestedCoverStartDate-year'] = today.getFullYear();
      }
    });
    return arr;
  };

  const modifiedDeal = deal;
  modifiedDeal.bondTransactions.items = updateFacilities(facilities.bonds);
  modifiedDeal.loanTransactions.items = updateFacilities(facilities.loans);

  const updatedDeal = await updateDeal(
    deal._id, // eslint-disable-line no-underscore-dangle,
    modifiedDeal,
    user,
  );

  return updatedDeal;
};

module.exports = updateFacilityCoverStartDates;
