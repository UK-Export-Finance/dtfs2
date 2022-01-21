const CONSTANTS = require('../../../constants');
const facilitiesController = require('../facilities.controller');

const updateSubmittedIssuedFacilities = async (user, deal) => {
  const modifiedDeal = deal;

  modifiedDeal.facilities.forEach(async (facilityId) => {
    const facility = await facilitiesController.findOne(facilityId);

    const { facilityStage } = facility;

    const isUnconditionalUnsubmittedLoan = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
                                            && !facility.issueFacilityDetailsSubmitted);

    const isIssuedUnsubmittedBond = (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
                                    && !facility.issueFacilityDetailsSubmitted);

    const shouldUpdate = (isUnconditionalUnsubmittedLoan || isIssuedUnsubmittedBond);

    if (shouldUpdate) {
      const now = Date.now();

      facility.updatedAt = now;

      facility.issueFacilityDetailsSubmitted = true;
      facility.issuedFacilitySubmittedToUkefTimestamp = now;
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
        facility.status = CONSTANTS.FACILITIES.DEAL_STATUS.COMPLETED;
      }
    }

    const facilityIsReadyForApproval = facility.status === CONSTANTS.FACILITIES.DEAL_STATUS.READY_FOR_APPROVAL;

    const facilityIssuedFromIssueFacilityForm = (shouldUpdate
                                                && facility.issueFacilityDetailsProvided
                                                && facilityIsReadyForApproval);

    if (facilityIssuedFromIssueFacilityForm) {
      facility.status = CONSTANTS.FACILITIES.DEAL_STATUS.SUBMITTED_TO_UKEF;
    }

    const { data } = await facilitiesController.update(
      deal._id,
      facilityId,
      facility,
      user,
    );

    return data;
  });

  return deal;
};

module.exports = updateSubmittedIssuedFacilities;
