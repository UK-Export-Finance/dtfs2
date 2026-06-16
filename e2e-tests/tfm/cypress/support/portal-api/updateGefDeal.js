const { updateGefDeal, logIn } = require('./api');

module.exports = (dealId, update, opts) => {
  console.info('updateGefDeal::');

  return logIn(opts).then((token) => updateGefDeal(dealId, update, token));
};
