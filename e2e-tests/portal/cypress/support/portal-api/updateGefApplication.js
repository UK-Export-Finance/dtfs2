const { updateGefApplication, logIn } = require('./api');

module.exports = (dealId, payload, opts) => {
  console.info('updateGefApplication::');

  logIn(opts).then((token) => updateGefApplication(dealId, payload, token).then((deal) => deal));
};
