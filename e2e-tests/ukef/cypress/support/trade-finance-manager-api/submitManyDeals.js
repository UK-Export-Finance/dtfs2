const { submitDeal, submitDealAfterUkefIds } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (deals) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];

  const isSessionForAPI = true;

  deals.forEach((dealToInsert) => {
    cy.login(T1_USER_1, isSessionForAPI)
      .then((token) => submitDeal(dealToInsert._id, dealToInsert.dealType, token).then(() => {
        // eslint-disable-next-line consistent-return
        submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, null, token).then((deal) => {
          persistedDeals.push(deal);
          if (persistedDeals.length === deals.length) {
            return persistedDeals;
          }
        });
      }));
  });
};
