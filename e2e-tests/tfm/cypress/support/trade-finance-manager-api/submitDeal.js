const { submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

module.exports = (dealId, dealType, opts) => {
  console.info('submitDeal::');

  cy.mockLogin(opts)
    .then((token) => submitDealAfterUkefIds(dealId, dealType, null, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};
