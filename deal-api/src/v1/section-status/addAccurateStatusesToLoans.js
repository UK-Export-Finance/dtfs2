// TODO: be DRY, this is very similar to section-status.

const loanStatus = (loanErrors) => {
  if (!loanErrors || loanErrors.count === 0) {
    return 'Completed';
  }
  return 'Incomplete';
};

module.exports = (loanTransactions, validationErrors) => {
  if (loanTransactions && loanTransactions.items && loanTransactions.items.length && validationErrors) {
    loanTransactions.items.forEach((b) => {
      const loan = b;
      const errorsForThisLoan = validationErrors[loan._id].errorList; // eslint-disable-line no-underscore-dangle
      loan.status = loanStatus(errorsForThisLoan);
    });
  }

  return loanTransactions;
};
