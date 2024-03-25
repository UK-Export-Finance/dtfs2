const { submitDealAfterUkefIds, login } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

module.exports = (dealId, dealType, opts) => {
  console.info('submitDeal::');
  const { username, password } = opts;

  login(username, password)
    .then((token) => submitDealAfterUkefIds(dealId, dealType, { _id: 'test-checker-id' }, token))
    .then((deal) => {
      cy.wrap(deal).as(ALIAS_KEY.SUBMIT_DEAL);
    });
};
