const { submitDeal, submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

/**
 * submitManyDeals
 * Login to TFM and submit many deals.
 * @param {Array} deals: Deals
 * @param {Object} user: User object
 */
const submitManyDeals = (deals, user) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];

  cy.tfmLogin({
    user,
    isSessionForAPI: true,
  }).then((token) => {
    cy.wrap(deals).each((dealToInsert) => {
      submitDeal(dealToInsert._id, dealToInsert.dealType, null, token);

      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, null, token)
        .then((submittedDeal) => {
          persistedDeals.push(submittedDeal);
        });
    });
    cy.wrap(persistedDeals).as(ALIAS_KEY.SUBMIT_MANY_DEALS);
  });
};

module.exports = submitManyDeals;
