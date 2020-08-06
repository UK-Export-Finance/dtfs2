const $ = require('mongo-dot-notation');

const updateIssuedFacilitiesStatuses = async (collection, deal) => {
  const updatedDeal = deal;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;

      const shouldUpdateLoan = (facility.facilityStage === 'Conditional' && facility.issueFacilityDetailsProvided);
      const shouldUpdateBond = (facility.bondStage === 'Unissued' && facility.issueFacilityDetailsProvided);
      const shouldUpdateStatus = ((shouldUpdateLoan || shouldUpdateBond) && !facility.issueFacilityDetailsSubmitted);

      if (shouldUpdateStatus) {
        facility.status = 'Ready for check';
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
