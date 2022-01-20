const { updateGefApplication, logIn } = require('./api');

module.exports = (dealId, payload, opts) => {
  console.log('setGefSubmissionType::');

  logIn(opts).then((token) => updateGefApplication(dealId, payload, token).then((deal) => deal));
};
