const { submitDealAfterUkefIds, login } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');
  const { username, password } = T1_USER_1;

  return login(username, password).then((token) => submitDealAfterUkefIds(dealId, dealType, BANK1_CHECKER1_WITH_MOCK_ID, token));
};
