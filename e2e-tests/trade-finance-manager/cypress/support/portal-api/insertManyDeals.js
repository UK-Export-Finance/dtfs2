const { insertDeal, logIn } = require('./api');

module.exports = (deals, opts) => {
  console.log(`createManyDeals::`);

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
