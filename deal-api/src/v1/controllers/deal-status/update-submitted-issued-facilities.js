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

      const isUnconditionalUnsubmittedLoan = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
                                             && !facility.issueFacilityDetailsSubmitted);

      const isIssuedUnsubmittedBond = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
                                      && !facility.issueFacilityDetailsSubmitted);

      const shouldUpdate = (isUnconditionalUnsubmittedLoan || isIssuedUnsubmittedBond);

      if (shouldUpdate) {
        facility.issueFacilityDetailsSubmitted = true;
        facility.issuedFacilitySubmittedToUkefTimestamp = now();
        facility.issuedFacilitySubmittedToUkefBy = user;

        if (!facility.previousFacilityStage
          && !facility.issueFacilityDetailsProvided) {
          // Facility has been issued at the Deal draft stage. Therefore:
          // - no need for Maker to Issue the facility from Issue Facility Form
          // - won't get 'Submitted' status (declared below when Issue Facility Form details provided)
          //
          // At this point, the facility status should not change - it's already been issued.
          // So, we 'lock' the status - everything is completed for this facility.
          //
          // Without this, the following would happen, which we do not want:
          // - the facility's status would continue to by dynamically generated
          // - the facility's status could be marked as 'incomplete', as dates become invalid
          facility.status = CONSTANTS.FACILITIES.STATUS.COMPLETED;
        }
      }

      const facilityIsReadyForApproval = facility.status === CONSTANTS.FACILITIES.STATUS.READY_FOR_APPROVAL;

      const facilityIssuedFromIssueFacilityForm = (shouldUpdate
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
