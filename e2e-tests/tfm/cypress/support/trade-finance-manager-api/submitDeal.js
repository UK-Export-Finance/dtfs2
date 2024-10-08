const { submitDealAfterUkefIds, login } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

module.exports = (dealId, dealType, opts) => {
  console.info('submitDeal::');
  const { username, password } = opts;

  login(username, password)
    .then((token) => submitDealAfterUkefIds(dealId, dealType, BANK1_CHECKER1_WITH_MOCK_ID, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};
