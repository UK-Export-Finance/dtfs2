const $ = require('mongo-dot-notation');
const CONSTANTS = require('../../../constants');

const updateSubmittedIssuedFacilities = async (collection, deal) => {
  const updatedDeal = deal;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;

      const {
        facilityStage,
        previousFacilityStage,
        bondStage,
      } = facility;

      const shouldUpdateIssuedLoan = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL
                                     && previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.CONDITIONAL);

      const shouldUpdateIssuedBond = (bondStage === CONSTANTS.FACILITIES.BOND_STAGE.ISSUED
                                     && previousFacilityStage === CONSTANTS.FACILITIES.BOND_STAGE.UNISSUED);

      const shouldUpdateIssuedFacility = ((shouldUpdateIssuedLoan
                                          || shouldUpdateIssuedBond)
                                          && facility.issueFacilityDetailsProvided
                                          && !facility.issueFacilityDetailsSubmitted
                                          && facility.status !== 'Submitted');

      if (shouldUpdateIssuedFacility) {
        facility.issueFacilityDetailsSubmitted = true;
        facility.status = 'Submitted';
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
