const { submitDealAfterUkefIds } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (dealId, dealType) => {
  console.info('submitDeal::');

  return cy.mockTfmLogin(T1_USER_1, null, false).then((token) => submitDealAfterUkefIds(dealId, dealType, null, token));
};
