const { submitDeal, submitDealAfterUkefIds, login } = require('./api');
const { ALIAS_KEY } = require('../../fixtures/constants');

module.exports = (deals, opts) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = opts;

  login(username, password).then((token) => {
    cy.wrap(deals).each((dealToInsert) => {
      submitDeal(dealToInsert._id, dealToInsert.dealType, null, token);

      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, { _id: '6602f568f609ff532522b472' }, token)
        .then((submittedDeal) => {
          persistedDeals.push(submittedDeal);
        });
    });
    cy.wrap(persistedDeals).as(ALIAS_KEY.SUBMIT_MANY_DEALS);
  });
};
