const $ = require('mongo-dot-notation');

const updateIssuedFacilitiesStatuses = async (collection, deal, newStatus, updateAllIssuedFacilities) => {
  const updatedDeal = deal;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;

      const shouldUpdateLoan = facility.facilityStage === 'Conditional';
      const shouldUpdateBond = facility.bondStage === 'Unissued';

      let shouldUpdate;
      if (updateAllIssuedFacilities) {
        // update all issued facilities regardless of if they've been submitted or have completed all required fields.
        shouldUpdate = (shouldUpdateLoan || shouldUpdateBond);
      } else {
        // only update issued facilities if they have all details provided and have NOT been submitted
        shouldUpdate = ((shouldUpdateLoan || shouldUpdateBond)
                        && facility.issueFacilityDetailsProvided
                        && !facility.issueFacilityDetailsSubmitted);
      }

      if (shouldUpdate) {
        facility.status = newStatus;
      }

      return facility;
    });
    return arr;
  };

  if (updatedDeal.loanTransactions.items.length > 0) {
    updatedDeal.loanTransactions.items = update(updatedDeal.loanTransactions.items);
  }

  if (updatedDeal.bondTransactions.items.length > 0) {
    updatedDeal.bondTransactions.items = update(updatedDeal.bondTransactions.items);
  }

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: deal._id }, // eslint-disable-line no-underscore-dangle
    $.flatten(updatedDeal),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = updateIssuedFacilitiesStatuses;
