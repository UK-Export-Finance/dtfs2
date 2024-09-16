const { submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

/**
 * submitDeal
 * Login to TFM and submit a deal.
 * @param {number} dealId: Deal ID
 * @param {string} dealType: Deal type
 * @param {object} user: User object
 */
const submitDeal = (dealId, dealType, user) => {
  console.info('submitDeal::');

  const isSessionForAPI = true;

  cy.login({ user, isSessionForAPI })
    .then((token) => submitDealAfterUkefIds(dealId, dealType, BANK1_CHECKER1_WITH_MOCK_ID, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};

module.exports = submitDeal;
