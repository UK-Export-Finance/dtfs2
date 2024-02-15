const { submitDealAfterUkefIds } = require('./api');

module.exports = (dealId, dealType, opts) => {
  console.info('submitDeal::');

  return cy.mockLogin(opts).then((token) => submitDealAfterUkefIds(dealId, dealType, null, token));
};
