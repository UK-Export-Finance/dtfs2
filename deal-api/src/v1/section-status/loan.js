const loanValidationErrors = require('../validation/loan');

const loanStatus = (loanErrors) => {
  if (loanErrors.count === 0) {
    return 'Completed';
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
