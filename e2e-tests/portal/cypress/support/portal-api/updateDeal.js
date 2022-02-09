const { logIn, updateDeal } = require('./api');

module.exports = (dealId, update, opts) => {
  console.info('updateDeal::');

  logIn(opts).then((token) => {
    updateDeal(dealId, update, token).then((persistedDeal) => persistedDeal);
  });
};
