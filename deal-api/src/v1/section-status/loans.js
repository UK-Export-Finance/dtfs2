const loanValidationErrors = require('../validation/loan');

const loanStatus = (loan, loanErrors) => {
  if (!loanErrors || loanErrors.count === 0) {
    // this will be 'Ready for checker', 'Submitted', or 'Acknowledged by UKEF'
    // this comes from either:
    // the deal status changing - when submitting a deal with an issued loan, we add a status to the loan.
    // otherwise the status originally came from workflow/xml.
    if (loan.status) {
      return loan.status;
    }

    // with no status - the deal has not been submitted/issued, and there are no validationErrors in the loan.
    return 'Completed';
  }

  // we have no status and the loan has validation errors, therefore Incomplete.
  return 'Incomplete';
};

const addAccurateStatusesToLoans = (loanTransactions) => {
  if (loanTransactions.items.length) {
    loanTransactions.items.forEach((l) => {
      const loan = l;
      const validationErrors = loanValidationErrors(loan);
      loan.status = loanStatus(loan, validationErrors);
    });
  }
  return loanTransactions;
};

module.exports = {
  loanStatus,
  addAccurateStatusesToLoans,
};
