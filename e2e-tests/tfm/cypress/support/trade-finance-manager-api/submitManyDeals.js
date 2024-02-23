const { submitDeal, submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

module.exports = (deals, opts) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];

  cy.login(opts).then((token) => {
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
