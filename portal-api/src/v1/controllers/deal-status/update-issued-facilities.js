const CONSTANTS = require('../../../constants');
const issuedDateValidationRules = require('../../validation/fields/issued-date');
const now = require('../../../now');
const facilitiesController = require('../facilities.controller');

const facilityHasValidIssuedDate = (facility, deal) => {
  const emptyErrorList = {};

  if (!facility.issuedDate) {
    return false;
  }

  const issuedDateValidationErrors = issuedDateValidationRules(
    facility,
    emptyErrorList,
    deal,
  );

  if (!issuedDateValidationErrors.issuedDate) {
    return true;
  }

  return false;
};

const isLoanFacility = (facilityType) =>
  facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN;

const isBondFacility = (facilityType) =>
  facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND;

const loanHasBeenPreviouslyIssued = (facilityStage, previousFacilityStage) => {
  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
      && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
        || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL)) {
    return true;
  }
  return false;
};

const bondHasBeenPreviouslyIssued = (facilityStage, previousFacilityStage) => {
  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
    && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
      || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED)) {
    return true;
  }

  return false;
};

const shouldUpdateFacility = (facility) => {
  const { facilityType, facilityStage, previousFacilityStage } = facility;

  if (isLoanFacility(facilityType)) {
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
      || loanHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  if (isBondFacility(facilityType)) {
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
      || bondHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  return false;
};

const updateIssuedFacilities = async (
  user,
  fromStatus,
  deal,
  canUpdateIssuedFacilitiesCoverStartDates,
  newStatus,
) => {
  const fromStatusIsApprovedStatus = (fromStatus === CONSTANTS.DEAL.STATUS.APPROVED
                                      || fromStatus === CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS);

  const isMIAdeal = deal.details.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  const isMINdeal = deal.details.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
  const dealHasBeenApproved = deal.details.approvalDate;

  let shouldUpdateCount = 0;
  let updatedCount = 0;

  return new Promise((resolve) => {
    if (deal.facilities.length) {
      deal.facilities.forEach(async (facilityId) => {
        const facility = await facilitiesController.findOne(facilityId);

        const { facilityStage, facilityType } = facility;

        const shouldUpdateStatus = (facility.issueFacilityDetailsStarted
                                    && facility.issueFacilityDetailsProvided
                                    && fromStatus !== CONSTANTS.DEAL.STATUS.DRAFT
                                    && facility.status !== CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED
                                    && (newStatus && newStatus.length > 0));

        if (shouldUpdateFacility(facility)) {
          shouldUpdateCount += 1;

          if (facility.issueFacilityDetailsProvided && !facility.issueFacilityDetailsSubmitted) {
            facility.lastEdited = now();
            facility.previousFacilityStage = facilityStage;

            if (shouldUpdateStatus) {
              facility.status = newStatus;
            }

            if (isLoanFacility(facilityType)) {
              facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL;
            } else if (isBondFacility(facilityType)) {
              facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED;
            }
          } else if (shouldUpdateStatus) {
            // update all issued facilities regardless of if
            // they've been submitted
            // ...or have completed all required fields.
            facility.status = newStatus;
            facility.lastEdited = now();
          }

          if (canUpdateIssuedFacilitiesCoverStartDates
            && !facility.issueFacilityDetailsSubmitted
            && !facility.requestedCoverStartDate) {
            if (fromStatusIsApprovedStatus && isMINdeal) {
              facility.lastEdited = now();
              facility.requestedCoverStartDate = deal.details.manualInclusionNoticeSubmissionDate;
            } else if (isMIAdeal && dealHasBeenApproved) {
              facility.lastEdited = now();
              facility.requestedCoverStartDate = now();
            } else if (facilityHasValidIssuedDate(facility, deal)) {
              facility.lastEdited = now();
              facility.requestedCoverStartDate = facility.issuedDate;
            }
          }

          await facilitiesController.update(facilityId, facility, user);

          updatedCount += 1;
        }

        if (updatedCount === shouldUpdateCount) {
          return resolve(deal);
        }
        return facility;
      });
    }
    return resolve(deal);
  });
};

module.exports = updateIssuedFacilities;
