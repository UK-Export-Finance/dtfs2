const CONSTANTS = require('../../../constants');
const issuedDateValidationRules = require('../../validation/fields/issued-date');
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

const isLoanFacility = (type) =>
  type === CONSTANTS.FACILITIES.FACILITY_TYPE.LOAN;

const isBondFacility = (type) =>
  type === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND;

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
  const { type, facilityStage, previousFacilityStage } = facility;

  if (isLoanFacility(type)) {
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
      || loanHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  if (isBondFacility(type)) {
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
  const fromStatusIsApprovedStatus = (fromStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
                                      || fromStatus === CONSTANTS.DEAL.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);

  const isMIAdeal = deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  const isMINdeal = deal.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;
  const dealHasBeenApproved = deal.details.approvalDate;

  let shouldUpdateCount = 0;
  let updatedCount = 0;

  return new Promise((resolve) => {
    if (deal.facilities.length) {
      deal.facilities.forEach(async (facilityId) => {
        const facility = await facilitiesController.findOne(facilityId);

        const { facilityStage, type } = facility;

        const shouldUpdateStatus = (facility.issueFacilityDetailsStarted
                                    && facility.issueFacilityDetailsProvided
                                    && fromStatus !== CONSTANTS.DEAL.DEAL_STATUS.DRAFT
                                    && facility.status !== CONSTANTS.FACILITIES.DEAL_STATUS.ACKNOWLEDGED
                                    && (newStatus && newStatus.length > 0));

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

          if (canUpdateIssuedFacilitiesCoverStartDates
            && !facility.issueFacilityDetailsSubmitted
            && !facility.requestedCoverStartDate) {
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

          await facilitiesController.update(
            deal._id,
            facilityId,
            facility,
            user,
          );

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
