const { submitDeal, submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

/**
 * submitManyDeals
 * Login to TFM and submit many deals.
 * @param {Array} deals Deals
 * @param {object} user User object
 */
const submitManyDeals = (deals, user) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];

  const isSessionForAPI = true;

  cy.login({ user, isSessionForAPI }).then((token) => {
    cy.wrap(deals).each((dealToInsert) => {
      submitDeal(dealToInsert._id, dealToInsert.dealType, null, token);

      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, BANK1_CHECKER1_WITH_MOCK_ID, token).then((submittedDeal) => {
        persistedDeals.push(submittedDeal);
      });
    });
    cy.wrap(persistedDeals).as(ALIAS_KEY.SUBMIT_MANY_DEALS);
  });
};

module.exports = submitManyDeals;
