const { submitDeal, submitDealAfterUkefIds, login } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

module.exports = (deals, opts) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = opts;

  login(username, password).then((token) => {
    cy.wrap(deals).each((dealToInsert) => {
      submitDeal(dealToInsert._id, dealToInsert.dealType, null, token);

      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, BANK1_CHECKER1_WITH_MOCK_ID, token).then((submittedDeal) => {
        persistedDeals.push(submittedDeal);
      });
    });
    cy.wrap(persistedDeals).as(ALIAS_KEY.SUBMIT_MANY_DEALS);
  });
};
