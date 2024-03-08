const { submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

/**
 * submitDeal
 * Login to TFM and submit a deal.
 * @param {Integer} dealId: Deal ID
 * @param {String} dealType: Deal type
 * @param {Object} user: User object
 */
const submitDeal = (dealId, dealType, user) => {
  console.info('submitDeal::');

  const isSessionForAPI = true;

  cy.login(user, isSessionForAPI)
    .then((token) => submitDealAfterUkefIds(dealId, dealType, null, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};

module.exports = submitDeal;
