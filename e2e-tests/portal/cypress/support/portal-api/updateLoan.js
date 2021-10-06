const { logIn, updateLoan } = require('./api');

module.exports = (dealId, loanId, update, opts) => {
  console.log('updateLoan::');

  logIn(opts).then((token) => {
    updateLoan(dealId, loanId, update, token).then((persistedLoan) => persistedLoan);
  });
};
