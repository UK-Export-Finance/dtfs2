const { insertDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (deals, opts) => {
  console.log(`createManyDeals::`);

  logIn(opts).then((token) => {
    const persistedDeals = [];

    deals.forEach((dealToInsert) => {
      getIdFromNumberGenerator('deal').then(({ id: numberGeneratorId }) => {
        const dealWithId = dealToInsert;

        dealWithId.details.ukefDealId = numberGeneratorId;
        dealWithId.submissionDetails['supplier-name'] = `Mock-Supplier-${numberGeneratorId}`;

        insertDeal(dealWithId, token).then((deal) => {
          persistedDeals.push(deal);

          if (persistedDeals.length === deals.length) {
            return persistedDeals;
          }
        });
      });
    });
  });
};
