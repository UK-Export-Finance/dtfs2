const bondValidationErrors = require('../validation/bond');
const bondIssueFacilityValidationErrors = require('../validation/bond-issue-facility');
const CONSTANTS = require('../../constants');

const bondStatus = (bond, bondErrors, bondIssueFacilityErrors) => {
  const hasBondErrors = (bondErrors && bondErrors.count !== 0);
  const hasBondIssueFacilityErrors = (bondIssueFacilityErrors && bondIssueFacilityErrors.count !== 0);

  // this will be 'Not started', 'Ready for check', 'Submitted', or 'Acknowledged'
  // this comes from either:
  // - the deal status changing - when submitting a deal with an issued bond, we add a status to the bond.
  // - workflow/xml.
  if (bond.status) {
    return bond.status;
  }

  // otherwise, status is dynamically checked
  if (!hasBondErrors && !hasBondIssueFacilityErrors) {
    return CONSTANTS.FACILITIES.STATUS.COMPLETED;
  }

  // we have no status and the bond has validation errors, therefore Incomplete.
  return CONSTANTS.FACILITIES.STATUS.INCOMPLETE;
};

const bondHasIncompleteIssueFacilityDetails = (dealStatus, previousDealStatus, dealSubmissionType, bond) => {
  const allowedDealStatus = ((dealStatus === 'Acknowledged by UKEF'
                            || dealStatus === 'Accepted by UKEF (with conditions)'
                            || dealStatus === 'Accepted by UKEF (without conditions)'
                            || dealStatus === 'Ready for Checker\'s approval'
                            || dealStatus === 'Submitted')
                            && previousDealStatus !== 'Draft');

  const allowedDealSubmissionType = (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
                                    || dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);

  const allowedFacilityStage = bond.bondStage === 'Unissued';

  if (allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && !bond.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToBonds = (
  deal,
) => {
  const {
    status: dealStatus,
    previousStatus: previousDealStatus,
    submissionType,
    submissionDate,
    manualInclusionNoticeSubmissionDate,
  } = deal.details;

  if (deal.bondTransactions.items.length) {
    deal.bondTransactions.items.forEach((b) => {
      const bond = b;
      const validationErrors = bondValidationErrors(bond, deal);
      let issueFacilityValidationErrors;

      if (bond.issueFacilityDetailsStarted
          && bondHasIncompleteIssueFacilityDetails(dealStatus, previousDealStatus, submissionType, bond)) {
        issueFacilityValidationErrors = bondIssueFacilityValidationErrors(
          bond,
          submissionType,
          submissionDate,
          manualInclusionNoticeSubmissionDate,
        );
      }

      bond.status = bondStatus(bond, validationErrors, issueFacilityValidationErrors);
    });
  }
  return deal.bondTransactions;
};

module.exports = {
  bondStatus,
  addAccurateStatusesToBonds,
};
