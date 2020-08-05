const $ = require('mongo-dot-notation');

const updateSubmittedIssuedFacilities = async (collection, deal) => {
  const updatedDeal = deal;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;

      const shouldUpdateIssuedLoanFacility = (facility.facilityStage === 'Conditional' && facility.issueFacilityDetailsProvided);
      const shouldUpdateIssuedBondFacility = (facility.bondStage === 'Unissued' && facility.issueFacilityDetailsProvided);
      const shouldUpdateIssuedFacility = (shouldUpdateIssuedLoanFacility || shouldUpdateIssuedBondFacility);

      if (shouldUpdateIssuedFacility) {
        facility.issueFacilityDetailsSubmitted = true;
        facility.status = 'Completed';

        if (!facility.requestedCoverStartDate) {
          facility.requestedCoverStartDate = facility.issuedDate;
        }
      }

      return facility;
    });
    return arr;
  };

  updatedDeal.loanTransactions.items = update(updatedDeal.loanTransactions.items);
  updatedDeal.bondTransactions.items = update(updatedDeal.bondTransactions.items);

  const findAndUpdateResponse = await collection.findOneAndUpdate(
    { _id: deal._id }, // eslint-disable-line no-underscore-dangle
    $.flatten(updatedDeal),
    { returnOriginal: false },
  );

  const { value } = findAndUpdateResponse;

  return value;
};

module.exports = updateSubmittedIssuedFacilities;
