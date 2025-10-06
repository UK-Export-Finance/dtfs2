const { submitDeal, login } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

module.exports = (dealId, dealType, opts) => {
  console.info('submitDeal::');
  const { username, password } = opts;

  login(username, password)
    .then((token) => submitDeal(dealId, dealType, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};
