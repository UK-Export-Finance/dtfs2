const { submitDealAfterUkefIds, login } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');
  const { username, password } = T1_USER_1;

  return login(username, password).then((token) => submitDealAfterUkefIds(dealId, dealType, { _id: '6602f568f609ff532522b472' }, token));
};
