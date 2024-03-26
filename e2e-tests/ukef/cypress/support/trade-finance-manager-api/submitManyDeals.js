const { submitDeal, submitDealAfterUkefIds, login } = require('./api');
const { T1_USER_1 } = require('../../../../e2e-fixtures/tfm-users.fixture');

module.exports = (deals) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = T1_USER_1;

  deals.forEach((dealToInsert) => {
    login(username, password).then((token) => submitDeal(dealToInsert._id, dealToInsert.dealType, token).then(() => {
      // eslint-disable-next-line consistent-return
      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, { _id: '6602f568f609ff532522b472' }, token).then((deal) => {
        persistedDeals.push(deal);
        if (persistedDeals.length === deals.length) {
          return persistedDeals;
        }
      });
    }));
  });
};
