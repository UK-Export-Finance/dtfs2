const { submitDeal } = require('./api');

module.exports = (deals, opts) => {
  const persistedDeals = [];

  deals.forEach((dealToInsert) => {
    console.log('submitMany deals - dealToInsert ', dealToInsert);
    submitDeal(dealToInsert._id).then((deal) => {
      console.log('submitMany deals - deal ', deal);

      persistedDeals.push(deal);

      if (persistedDeals.length === deals.length) {
        return persistedDeals;
      }
    });
  });
};
