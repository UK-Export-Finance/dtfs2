const { updateGefDeal, logIn } = require('./api');

module.exports = (dealId, update, opts) => {
  console.info('updateGefDeal::');
  logIn(opts).then((token) => {
    updateGefDeal(dealId, update, token)
      .then((updatedDeal) => updatedDeal);
  });
};
