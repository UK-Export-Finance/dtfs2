const { logIn, updateBond } = require('./api');

module.exports = (dealId, bondId, update, opts) => {
  console.log('updateBond::');

  logIn(opts).then((token) => {
    updateBond(dealId, bondId, update, token).then((persistedLoan) => persistedLoan);
  });
};
