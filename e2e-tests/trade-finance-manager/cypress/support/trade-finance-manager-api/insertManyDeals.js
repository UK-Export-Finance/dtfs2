const { insertDeal, logIn } = require('../portal-api/api');

module.exports = (deals, opts) => {
  logIn(opts).then((token) => {
    const persistedDeals = [];

    deals.forEach((dealToInsert) => {
      insertDeal(dealToInsert, token).then((deal) => {
        persistedDeals.push(deal);

        if (persistedDeals.length === deals.length) {
          return persistedDeals;
        }
      });
    });
  });
};
