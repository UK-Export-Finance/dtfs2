const loanValidationErrors = require('../validation/loan');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const isValidationRequired = require('../validation/is-validation-required');
const CONSTANTS = require('../../constants');

const loanStatus = (loan, loanErrors, loanIssueFacilityErrors) => {
  const hasLoanErrors = (loanErrors && loanErrors.count !== 0);
  const hasLoanIssueFacilityErrors = (loanIssueFacilityErrors && loanIssueFacilityErrors.count !== 0);

  // this will be 'Not started', 'Ready for check', 'Submitted', 'Acknowledged', 'Completed'
  // this comes the deal status changing - when submitting a deal with an issued loan, we add a status to the loan.
  if (loan.status) {
    return loan.status;
  }

  // otherwise, status is dynamically checked
  if (!hasLoanErrors && !hasLoanIssueFacilityErrors) {
    return CONSTANTS.FACILITIES.DEAL_STATUS.COMPLETED;
  }

  // we have no status and the loan has validation errors, therefore Incomplete.
  return CONSTANTS.FACILITIES.DEAL_STATUS.INCOMPLETE;
};

const loanHasIncompleteIssueFacilityDetails = (dealStatus, previousDealStatus, loan) => {
  const allowedDealStatus = ((dealStatus === 'Acknowledged'
                            || dealStatus === 'Accepted by UKEF (with conditions)'
                            || dealStatus === 'Accepted by UKEF (without conditions)'
                            || dealStatus === 'Ready for Checker\'s approval'
                            || dealStatus === 'Submitted')
                            && previousDealStatus !== 'Draft');

  const allowedFacilityStage = loan.facilityStage === 'Conditional';

  if (allowedDealStatus
    && allowedFacilityStage
    && !loan.issueFacilityDetailsSubmitted) {
    return true;
  }

  return false;
};

const addAccurateStatusesToLoans = (
  deal,
) => {
  const {
    status: dealStatus,
    previousStatus: previousDealStatus,
  } = deal;

  if (deal.loanTransactions.items.length) {
    deal.loanTransactions.items.forEach((l) => {
      const loan = l;
      const validationErrors = isValidationRequired(deal) && loanValidationErrors(loan, deal);
      let issueFacilityValidationErrors;

      if (loan.issueFacilityDetailsStarted
          && loanHasIncompleteIssueFacilityDetails(dealStatus, previousDealStatus, loan)) {
        issueFacilityValidationErrors = loanIssueFacilityValidationErrors(
          loan,
          deal,
        );
      }

      loan.status = loanStatus(loan, validationErrors, issueFacilityValidationErrors);
    });
  }
  return deal.loanTransactions;
};

module.exports = {
  loanStatus,
  loanHasIncompleteIssueFacilityDetails,
  addAccurateStatusesToLoans,
};
