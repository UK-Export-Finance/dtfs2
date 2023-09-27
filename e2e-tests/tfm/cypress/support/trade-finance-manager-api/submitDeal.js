const { submitDealAfterUkefIds, login } = require('./api');

module.exports = (dealId, dealType, opts) => {
  console.info('submitDeal::');
  const { username, password } = opts;

  return login(username, password).then((token) => submitDealAfterUkefIds(dealId, dealType, null, token));
};
