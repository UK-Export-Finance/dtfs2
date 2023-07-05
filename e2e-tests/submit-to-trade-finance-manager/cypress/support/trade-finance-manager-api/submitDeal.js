const { submitDealAfterUkefIds, login } = require('./api');
const { TFM_USER } = require('../../fixtures/tfm-users');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');
  const { username, password } = TFM_USER;

  return login(username, password).then((token) => submitDealAfterUkefIds(dealId, dealType, token));
};
