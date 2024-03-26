const { submitDealAfterUkefIds } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');

  const isSessionForAPI = true;

  return cy.tfmLogin(T1_USER_1, isSessionForAPI)
    .then((token) => submitDealAfterUkefIds(dealId, dealType, null, token));
};
