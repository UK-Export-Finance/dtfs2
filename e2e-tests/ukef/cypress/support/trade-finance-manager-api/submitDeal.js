const { submitDealAfterUkefIds } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');

  return cy.tfmLogin({
    user: T1_USER_1,
    isSessionForAPI: true,
  }).then((token) => submitDealAfterUkefIds(dealId, dealType, null, token));
};
