const { setGefSubmissionType, logIn } = require('./api');

module.exports = (dealId, payload, opts) => {
  console.log('setGefSubmissionType::');

  logIn(opts).then((token) => setGefSubmissionType(dealId, payload, token).then((deal) => deal));
};
