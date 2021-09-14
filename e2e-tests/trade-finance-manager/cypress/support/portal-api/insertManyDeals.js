const { insertDeal, getDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (deals, opts) => {
  console.log(`createManyDeals::`);

  logIn(opts).then((token) => {
    const persisted = [];

    deals.forEach((dealToInsert) => {
      getIdFromNumberGenerator('deal').then(({ id: numberGeneratorId }) => {
        const dealWithId = dealToInsert;

        dealWithId.details.ukefDealId = numberGeneratorId;
        dealWithId.submissionDetails['supplier-name'] = `Mock-Supplier-${numberGeneratorId}`;

        insertDeal(dealWithId, token).then((insertedDeal) => {
          // persistedDeals.push(deal);

          // if (persistedDeals.length === deals.length) {
          //   return persistedDeals;
          // }
          getDeal(insertedDeal._id, token).then(({ deal }) => {
            persisted.push(deal);
            if (persisted.length === deals.length) {
              return persisted;
            }
          });
        });
      });
    });
  });
};
