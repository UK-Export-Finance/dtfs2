const CONSTANTS = require('../../../constants');
const issuedDateValidationRules = require('../../validation/fields/issued-date');
const facilitiesController = require('../facilities.controller');

const facilityHasValidIssuedDate = (facility, deal) => {
  const emptyErrorList = {};

  if (!facility.issuedDate) {
    return false;
  }

  const issuedDateValidationErrors = issuedDateValidationRules(facility, emptyErrorList, deal);

  return !issuedDateValidationErrors.issuedDate;
};

const isLoanFacility = (type) => type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN;

const isBondFacility = (type) => type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND;

const loanHasBeenPreviouslyIssued = (facilityStage, previousFacilityStage) => {
  const { UNCONDITIONAL, CONDITIONAL } = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN;
  return facilityStage === UNCONDITIONAL && (previousFacilityStage === CONDITIONAL || previousFacilityStage === UNCONDITIONAL);
};

const bondHasBeenPreviouslyIssued = (facilityStage, previousFacilityStage) => {
  const { ISSUED, UNISSUED } = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND;
  return facilityStage === ISSUED && (previousFacilityStage === UNISSUED || previousFacilityStage === ISSUED);
};

const shouldUpdateFacility = (facility) => {
  const { type, facilityStage, previousFacilityStage } = facility;
  const { CONDITIONAL } = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN;
  const { UNISSUED } = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND;

  if (isLoanFacility(type)) {
    if (facilityStage === CONDITIONAL || loanHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  if (isBondFacility(type)) {
    if (facilityStage === UNISSUED || bondHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  return false;
};

const updateIssuedFacilities = (user, fromStatus, deal, canUpdateIssuedFacilitiesCoverStartDates, newStatus) => {
  const { UKEF_APPROVED_WITHOUT_CONDITIONS, UKEF_APPROVED_WITH_CONDITIONS } = CONSTANTS.DEAL.DEAL_STATUS;
  const fromStatusIsApprovedStatus = fromStatus === UKEF_APPROVED_WITHOUT_CONDITIONS || fromStatus === UKEF_APPROVED_WITH_CONDITIONS;

  const isMIAdeal = deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  const isMINdeal = deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
  const dealHasBeenApproved = deal.details.approvalDate;

  let shouldUpdateCount = 0;
  let updatedCount = 0;

  return new Promise((resolve) => {
    if (deal.facilities.length) {
      deal.facilities.forEach(async (facilityId) => {
        const facility = await facilitiesController.findOne(facilityId);

        const { facilityStage } = facility;

        const shouldUpdateStatus = facility.issueFacilityDetailsStarted
          && facility.issueFacilityDetailsProvided
          && fromStatus !== CONSTANTS.DEAL.DEAL_STATUS.DRAFT
          && facility.status !== CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED
          && newStatus
          && newStatus.length > 0;

        if (shouldUpdateFacility(facility)) {
          shouldUpdateCount += 1;

          if (facility.issueFacilityDetailsProvided && !facility.issueFacilityDetailsSubmitted) {
            facility.updatedAt = Date.now();
            facility.previousFacilityStage = facilityStage;

            if (shouldUpdateStatus) {
              facility.status = newStatus;
            }
          } else if (shouldUpdateStatus) {
            // update all issued facilities regardless of if
            // they've been submitted
            // ...or have completed all required fields.
            facility.status = newStatus;
            facility.updatedAt = Date.now();
          }

          if (canUpdateIssuedFacilitiesCoverStartDates && !facility.issueFacilityDetailsSubmitted && !facility.requestedCoverStartDate) {
            if (fromStatusIsApprovedStatus && isMINdeal) {
              facility.updatedAt = Date.now();
              facility.requestedCoverStartDate = deal.details.manualInclusionNoticeSubmissionDate;
            } else if (isMIAdeal && dealHasBeenApproved) {
              const now = Date.now();
              facility.updatedAt = now;
              facility.requestedCoverStartDate = now;
            } else if (facilityHasValidIssuedDate(facility, deal)) {
              facility.updatedAt = Date.now();
              facility.requestedCoverStartDate = facility.issuedDate;
            }
          }

          await facilitiesController.update(deal._id, facilityId, facility, user);

          updatedCount += 1;
        }

        if (updatedCount === shouldUpdateCount) {
          return resolve(deal);
        }
        return facility;
      });
    }
    // eslint-disable-next-line no-promise-executor-return
    return resolve(deal);
  });
};

module.exports = updateIssuedFacilities;
