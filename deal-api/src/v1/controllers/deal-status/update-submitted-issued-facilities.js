const $ = require('mongo-dot-notation');
const CONSTANTS = require('../../../constants');
const now = require('../../../now');

const updateSubmittedIssuedFacilities = async (user, collection, deal) => {
  const updatedDeal = deal;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;

      const { facilityStage } = facility;

      const shouldUpdateLoan = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
                                && !facility.issueFacilityDetailsSubmitted);

      const shouldUpdateBond = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
                                && !facility.issueFacilityDetailsSubmitted);

      if (shouldUpdateLoan || shouldUpdateBond) {
        facility.issueFacilityDetailsSubmitted = true;
        facility.issuedFacilitySubmittedToUkefTimestamp = now();
        facility.issuedFacilitySubmittedToUkefBy = user;
      }

      const facilityIsReadyForApproval = facility.status === CONSTANTS.FACILITIES.STATUS.READY_FOR_APPROVAL;

      // TODO / clarify (check e2e tests?)
      // here we are now only adding Submitted facility status
      // if the facility has completed Issue Facility form.
      // I *think* this is correct.....
      const facilityIssuedFromIssueFacilityForm = ((shouldUpdateLoan
                                                  || shouldUpdateBond)
                                                  && facility.issueFacilityDetailsProvided
                                                  && facilityIsReadyForApproval);

      if (facilityIssuedFromIssueFacilityForm) {
        facility.status = CONSTANTS.FACILITIES.STATUS.SUBMITTED;
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
