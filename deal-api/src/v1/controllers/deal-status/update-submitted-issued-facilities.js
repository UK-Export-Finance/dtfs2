const $ = require('mongo-dot-notation');
const CONSTANTS = require('../../../constants');
const now = require('../../../now');

const updateSubmittedIssuedFacilities = async (user, collection, deal) => {
  const updatedDeal = deal;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;

      const {
        facilityStage,
        bondStage,
      } = facility;

      const shouldUpdateLoan = facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.UNCONDITIONAL;
      const shouldUpdateBond = bondStage === CONSTANTS.FACILITIES.BOND_STAGE.ISSUED;

      const shouldUpdateIssuedFacility = ((shouldUpdateLoan
                                          || shouldUpdateBond)
                                          && facility.issueFacilityDetailsProvided
                                          && facility.status === CONSTANTS.FACILITIES.STATUS.READY_FOR_APPROVAL);

      if (shouldUpdateIssuedFacility) {
        facility.issueFacilityDetailsSubmitted = true;
        facility.status = CONSTANTS.FACILITIES.STATUS.SUBMITTED;
        facility.issuedFacilitySubmittedToUkefTimestamp = now();
        facility.issuedFacilitySubmittedToUkefBy = user;
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
