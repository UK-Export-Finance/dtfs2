const $ = require('mongo-dot-notation');
const now = require('../../../now');
const CONSTANTS = require('../../../constants');

const updateFacilityCoverStartDates = async (collection, deal) => {
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
        facility.requestedCoverStartDate = now();
        facility['requestedCoverStartDate-day'] = today.getDate();
        facility['requestedCoverStartDate-month'] = today.getMonth() + 1;
        facility['requestedCoverStartDate-year'] = today.getFullYear();
      }
    });
    return arr;
  };

  const updatedDeal = deal;
  updatedDeal.bondTransactions.items = updateFacilities(facilities.bonds);
  updatedDeal.loanTransactions.items = updateFacilities(facilities.loans);

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: deal._id }, // eslint-disable-line no-underscore-dangle
    $.flatten(updatedDeal),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = updateFacilityCoverStartDates;
