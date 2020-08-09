const loanValidationErrors = require('../validation/loan');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');

const loanStatus = (loan, loanErrors, loanIssueFacilityErrors) => {
  const hasLoanErrors = (loanErrors && loanErrors.count !== 0);
  const hasLoanIssueFacilityErrors = (loanIssueFacilityErrors && loanIssueFacilityErrors.count !== 0);

  if (!hasLoanErrors && !hasLoanIssueFacilityErrors) {
    // this will be 'Ready for checker', 'Submitted', or 'Acknowledged by UKEF'

    // this comes from either:
    // the deal status changing - when submitting a deal with an issued loan, we add a status to the loan.
    // otherwise the status comes from workflow/xml.
    if (loan.status) {
      return loan.status;
    }

    return 'Completed';
  }

  // we have no status and the loan has validation errors, therefore Incomplete.
  return 'Incomplete';
};

const loanHasIncompleteIssueFacilityDetails = (dealStatus, dealSubmissionType, loan) => {
  const allowedDealStatus = (dealStatus === 'Acknowledged by UKEF' || dealStatus === 'Ready for Checker\'s approval');
  const allowedDealSubmissionType = (dealSubmissionType === 'Automatic Inclusion Notice' || dealSubmissionType === 'Manual Inclusion Notice');
  const allowedFacilityStage = loan.facilityStage === 'Conditional';

  if (allowedDealStatus
    && allowedDealSubmissionType
    && allowedFacilityStage
    && loan.issueFacilityDetailsStarted
    && !loan.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToLoans = (dealStatus, dealSubmissionType, loanTransactions) => {
  if (loanTransactions.items.length) {
    loanTransactions.items.forEach((l) => {
      const loan = l;
      const validationErrors = loanValidationErrors(loan);
      let issueFacilityValidationErrors;

      if (loanHasIncompleteIssueFacilityDetails(dealStatus, dealSubmissionType, loan)) {
        issueFacilityValidationErrors = loanIssueFacilityValidationErrors(loan);
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
