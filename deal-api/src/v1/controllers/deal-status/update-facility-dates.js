const $ = require('mongo-dot-notation');
const now = require('../../../now');

const updateFacilityDates = async (collection, deal) => {
  const facilities = {
    bonds: deal.bondTransactions.items,
    loans: deal.loanTransactions.items,
  };

  const updateFacilities = (arr) => {
    arr.forEach((f) => {
      const facility = f;

      // TODO: rename bondStage to `facilityStage`
      const shouldUpdateRequestedCoverStartDate = (facility.bondStage === 'Issued' && !facility.requestedCoverStartDate)
        || (facility.facilityStage === 'Unconditional' && !facility.requestedCoverStartDate);

      if (shouldUpdateRequestedCoverStartDate) {
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

module.exports = updateFacilityDates;
