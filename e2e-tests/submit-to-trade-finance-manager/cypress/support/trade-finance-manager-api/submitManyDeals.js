const { submitDeal, submitDealAfterUkefIds, login } = require('./api');
const { TFM_USER } = require('../../fixtures/tfm-users');

module.exports = (deals) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];
  const { username, password } = TFM_USER;

  deals.forEach((dealToInsert) => {
    login(username, password).then((token) => submitDeal(dealToInsert._id, dealToInsert.dealType, token).then(() => {
      // eslint-disable-next-line consistent-return
      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType, token).then((deal) => {
        persistedDeals.push(deal);
        if (persistedDeals.length === deals.length) {
          return persistedDeals;
        }
      });
    }));
  });
};
