const { submitDeal, submitDealAfterUkefIds, login } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');
const { BANK1_CHECKER1_WITH_MOCK_ID } = require('../../../../e2e-fixtures/portal-users.fixture');

module.exports = (deals) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = T1_USER_1;

  deals.forEach((dealToInsert) => {
    login(username, password).then((token) =>
      submitDeal(dealToInsert._id, dealToInsert.dealType, token).then(() => {
        // eslint-disable-next-line consistent-return
        submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, BANK1_CHECKER1_WITH_MOCK_ID, token).then((deal) => {
          persistedDeals.push(deal);
          if (persistedDeals.length === deals.length) {
            return persistedDeals;
          }
          return null;
        });
      }),
    );
  });
};
