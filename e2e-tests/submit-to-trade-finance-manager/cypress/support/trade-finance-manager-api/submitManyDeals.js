const { submitDeal, submitDealAfterUkefIds } = require('./api');

module.exports = (deals) => {
  console.info('submitManyDeals::');
  const persistedDeals = [];

  deals.forEach((dealToInsert) => {
    submitDeal(dealToInsert._id, dealToInsert.dealType).then(() => {
      submitDealAfterUkefIds(dealToInsert._id, dealToInsert.dealType).then((deal) => {
        persistedDeals.push(deal);
        if (persistedDeals.length === deals.length) {
          return persistedDeals;
        }
      });
    });
  });
};
