const { submitDealAfterUkefIds } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

module.exports = (dealId, dealType, user) => {
  console.info('submitDeal::');

  cy.tfmLogin({
    user,
    isSessionForAPI: true,
  }).then((token) => submitDealAfterUkefIds(dealId, dealType, null, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};
