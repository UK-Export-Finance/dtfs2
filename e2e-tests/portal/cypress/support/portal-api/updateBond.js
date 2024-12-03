const { logIn, updateBond } = require('./api');

module.exports = (dealId, bondId, update, opts) => {
  console.info('updateBond::');

  logIn(opts).then((token) => {
    updateBond(dealId, bondId, update, token).then((persistedLoan) => persistedLoan);
  });
};
