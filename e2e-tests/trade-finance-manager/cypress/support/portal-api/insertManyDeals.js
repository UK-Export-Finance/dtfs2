const { insertDeal, getDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (deals, opts) => {
  console.info('createManyDeals::');

  logIn(opts).then((token) => {
    const persistedDeals = [];

    deals.forEach((dealToInsert) => {
      const ukefId = getIdFromNumberGenerator();

      const dealWithId = dealToInsert;
      dealWithId.details.ukefDealId = ukefId;
      dealWithId.submissionDetails['supplier-name'] = `Mock-Supplier-${ukefId}`;

      insertDeal(dealWithId, token).then((insertedDeal) => {
        getDeal(insertedDeal._id, token).then(({ deal }) => {
          persistedDeals.push(deal);
          if (persistedDeals.length === deals.length) {
            return persistedDeals;
          }
        });
      });
    });
  });
};
