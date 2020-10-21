const $ = require('mongo-dot-notation');
const CONSTANTS = require('../../../constants');
const issuedDateValidationRules = require('../../validation/fields/issued-date');
const now = require('../../../now');

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

const isLoanFacility = (facilityStage) => {
  // TODO: workaround until we have a `facilityType` on every facility

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
    || facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL) {
    return true;
  }

  return false;
};

const isBondFacility = (facilityStage) => {
  // TODO: workaround until we have a `facilityType` on every facility

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
    || facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED) {
    return true;
  }

  return false;
};

const loanHasBeenPreviouslyIssued = (facilityStage, previousFacilityStage) => {
  // TODO: maybe don't need the previousFacilityStage check?

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
      && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
        || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL)) {
    return true;
  }
  return false;
};

const bondHasBeenPreviouslyIssued = (facilityStage, previousFacilityStage) => {
  // TODO: maybe don't need the previousFacilityStage check?

  if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
    && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
      || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED)) {
    return true;
  }

  return false;
};

const shouldUpdateFacility = (facility) => {
  const { facilityStage, previousFacilityStage } = facility;

  if (isLoanFacility(facilityStage)) {
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
      || loanHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  if (isBondFacility(facilityStage)) {
    if (facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
      || bondHasBeenPreviouslyIssued(facilityStage, previousFacilityStage)) {
      return true;
    }
  }

  return false;
};

const updateIssuedFacilities = async (
  collection,
  fromStatus,
  deal,
  canUpdateIssuedFacilitiesCoverStartDates,
  newStatus,
) => {
  const updatedDeal = deal;

  const fromStatusIsApprovedStatus = (fromStatus === CONSTANTS.DEAL.STATUS.APPROVED
                                      || fromStatus === CONSTANTS.DEAL.STATUS.APPROVED_WITH_CONDITIONS);

  const isMIAdeal = deal.details.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIA;
  const isMINdeal = deal.details.submissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN;

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;
      const { facilityStage } = facility;

      const shouldUpdateStatus = (facility.issueFacilityDetailsStarted
                                  && facility.issueFacilityDetailsProvided
                                  && fromStatus !== CONSTANTS.DEAL.STATUS.DRAFT
                                  && facility.status !== CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED
                                  && (newStatus && newStatus.length > 0));

      if (shouldUpdateFacility(facility)) {
        if (facility.issueFacilityDetailsProvided && !facility.issueFacilityDetailsSubmitted) {
          if (shouldUpdateStatus) {
            facility.status = newStatus;
          }

          facility.previousFacilityStage = facilityStage;

          if (isLoanFacility(facilityStage)) {
            facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL;
          } else if (isBondFacility(facilityStage)) {
            facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED;
          }
        } else if (shouldUpdateStatus) {
          // update all issued facilities regardless of if they've been submitted or have completed all required fields.
          facility.status = newStatus;
        }

        if (canUpdateIssuedFacilitiesCoverStartDates
          && !facility.issueFacilityDetailsSubmitted
          && !facility.requestedCoverStartDate) {
          if (fromStatusIsApprovedStatus && isMINdeal) {
            facility.requestedCoverStartDate = deal.details.manualInclusionNoticeSubmissionDate;
          } else if (isMIAdeal) {
            facility.requestedCoverStartDate = now();
          } else if (facilityHasValidIssuedDate(facility, deal)) {
            facility.requestedCoverStartDate = facility.issuedDate;
          }
        }
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

module.exports = updateIssuedFacilities;
