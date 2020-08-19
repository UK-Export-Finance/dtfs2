const loanValidationErrors = require('../validation/loan');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const CONSTANTS = require('../../constants');

const loanStatus = (loan, loanErrors, loanIssueFacilityErrors) => {
  const hasLoanErrors = (loanErrors && loanErrors.count !== 0);
  const hasLoanIssueFacilityErrors = (loanIssueFacilityErrors && loanIssueFacilityErrors.count !== 0);

  // this will be 'Not started', 'Ready for check', 'Submitted', or 'Acknowledged'
  // this comes from either:
  // - the deal status changing - when submitting a deal with an issued loan, we add a status to the loan.
  // - workflow/xml.
  if (loan.status) {
    return loan.status;
  }

  // otherwise, status is dynamically checked
  if (!hasLoanErrors && !hasLoanIssueFacilityErrors) {
    return 'Completed';
  }

  // we have no status and the loan has validation errors, therefore Incomplete.
  return 'Incomplete';
};

const loanHasIncompleteIssueFacilityDetails = (dealStatus, previousDealStatus, dealSubmissionType, loan) => {
  const allowedDealStatus = ((dealStatus === 'Acknowledged by UKEF'
                            || dealStatus === 'Accepted by UKEF (with conditions)'
                            || dealStatus === 'Accepted by UKEF (without conditions)'
                            || dealStatus === 'Ready for Checker\'s approval')
                            && previousDealStatus !== 'Draft');

  const allowedDealSubmissionType = (dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.AIN
                                    || dealSubmissionType === CONSTANTS.DEAL.SUBMISSION_TYPE.MIN);

  const allowedFacilityStage = loan.facilityStage === 'Conditional';

  if (allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && !loan.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToLoans = (
  dealStatus,
  previousDealStatus,
  dealSubmissionType,
  dealSubmissionDate,
  loanTransactions,
) => {
  if (loanTransactions.items.length) {
    loanTransactions.items.forEach((l) => {
      const loan = l;
      const validationErrors = loanValidationErrors(loan);
      let issueFacilityValidationErrors;

      if (loanHasIncompleteIssueFacilityDetails(dealStatus, previousDealStatus, dealSubmissionType, loan)) {
        issueFacilityValidationErrors = loanIssueFacilityValidationErrors(loan, dealSubmissionDate);
      }

      loan.status = loanStatus(loan, validationErrors, issueFacilityValidationErrors);
    });
  }
  return loanTransactions;
};

module.exports = {
  loanStatus,
  addAccurateStatusesToLoans,
};
