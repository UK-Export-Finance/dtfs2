const $ = require('mongo-dot-notation');
const CONSTANTS = require('../../../constants');
const issuedDateValidationRules = require('../../validation/fields/issued-date');

const facilityHasValidIssuedDate = (facility, dealSubmissionDate) => {
  const emptyErrorList = {};

  if (!facility.issuedDate) {
    return false;
  }

  const issuedDateValidationErrors = issuedDateValidationRules(
    facility,
    emptyErrorList,
    dealSubmissionDate,
  );

  if (!issuedDateValidationErrors.issuedDate) {
    return true;
  }

  return false;
};


const updateIssuedFacilities = async (
  collection,
  fromStatus,
  deal,
  updateIssuedFacilitiesCoverStartDates = false,
  newStatus,
) => {
  const updatedDeal = deal;

  const dealStatusAllowsIssuedFacilitiesStatusChanges = (fromStatus && fromStatus !== 'Draft');

  const update = (facilities) => {
    const arr = facilities;

    arr.forEach((f) => {
      const facility = f;
      const {
        facilityStage,
        previousFacilityStage,
      } = facility;

      // TODO: rework this when we rename facilityStage to facilityStage
      const loanHasBeenPreviouslyIssued = facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL
        && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
            || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL);

      const shouldUpdateLoan = facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.CONDITIONAL
                               || loanHasBeenPreviouslyIssued;

      const bondHasBeenPreviouslyIssued = (facility.facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED
        && (previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
        || previousFacilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED));

      const shouldUpdateBond = facility.facilityStage === CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED
                               || bondHasBeenPreviouslyIssued;

      const shouldUpdateStatus = (facility.issueFacilityDetailsStarted
                                  && facility.issueFacilityDetailsProvided
                                  && dealStatusAllowsIssuedFacilitiesStatusChanges
                                  && facility.status !== CONSTANTS.FACILITIES.STATUS.ACKNOWLEDGED
                                  && (newStatus && newStatus.length > 0));

      if (shouldUpdateLoan || shouldUpdateBond) {
        if (facility.issueFacilityDetailsProvided && !facility.issueFacilityDetailsSubmitted) {
          if (shouldUpdateStatus) {
            facility.status = newStatus;
          }

          if (shouldUpdateLoan) {
            facility.previousFacilityStage = facility.facilityStage;
            facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.LOAN.UNCONDITIONAL;
          } else if (shouldUpdateBond) {
            facility.previousFacilityStage = facility.facilityStage;
            facility.facilityStage = CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED;
          }
        } else if (shouldUpdateStatus) {
          // update all issued facilities regardless of if they've been submitted or have completed all required fields.
          facility.status = newStatus;
        }

        if (updateIssuedFacilitiesCoverStartDates
          && !facility.issueFacilityDetailsSubmitted
          && !facility.requestedCoverStartDate
          && facilityHasValidIssuedDate(facility, deal.details.submissionDate)) {
          facility.requestedCoverStartDate = facility.issuedDate;
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
