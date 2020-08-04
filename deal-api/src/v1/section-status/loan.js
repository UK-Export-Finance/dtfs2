const loanValidationErrors = require('../validation/loan');

const loanStatus = (loan, loanErrors) => {
  if (!loanErrors || loanErrors.count === 0) {
    if (loan.issueFacilityDetailsProvided) {
      // this will either be 'Ready for checker' or 'Submitted'
      return loan.status;
    }
    return 'Completed'
  }
  return 'Incomplete';
};

const multipleLoanStatus = (loanTransactions) => {
  if (loanTransactions.items.length) {
    loanTransactions.items.forEach((l) => {
      const loan = l;
      const validationErrors = loanValidationErrors(loan);
      loan.status = loanStatus(validationErrors);
    });
  }
  return loanTransactions;
};

module.exports = {
  loanStatus,
  multipleLoanStatus,
};
