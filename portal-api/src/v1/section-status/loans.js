const loanValidationErrors = require('../validation/loan');
const loanIssueFacilityValidationErrors = require('../validation/loan-issue-facility');
const isValidationRequired = require('../validation/is-validation-required');
const CONSTANTS = require('../../constants');

const loanStatus = (loan, loanErrors, loanIssueFacilityErrors) => {
  const hasLoanErrors = (loanErrors && loanErrors.count !== 0);
  const hasLoanIssueFacilityErrors = (loanIssueFacilityErrors && loanIssueFacilityErrors.count !== 0);

  // this will be 'Not started', 'Ready for check', 'Submitted', 'Acknowledged', 'Completed'
  // this comes from either:
  // - the deal status changing - when submitting a deal with an issued loan, we add a status to the loan.
  // - workflow/xml.
  if (loan.status) {
    return loan.status;
  }

  // otherwise, status is dynamically checked
  if (!hasLoanErrors && !hasLoanIssueFacilityErrors) {
    return CONSTANTS.FACILITIES.STATUS.COMPLETED;
  }

  // we have no status and the loan has validation errors, therefore Incomplete.
  return CONSTANTS.FACILITIES.STATUS.INCOMPLETE;
};

const loanHasIncompleteIssueFacilityDetails = (dealStatus, previousDealStatus, loan) => {
  const allowedDealStatus = ((dealStatus === 'Acknowledged by UKEF'
                            || dealStatus === 'Accepted by UKEF (with conditions)'
                            || dealStatus === 'Accepted by UKEF (without conditions)'
                            || dealStatus === 'Ready for Checker\'s approval'
                            || dealStatus === 'Submitted')
                            && previousDealStatus !== 'DRAFT');

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
  } = deal.details;

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
