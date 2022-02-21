const { insertGefDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../reference-data-api/api');

module.exports = (deals, opts) => {
  console.info('createManyGefDeals::');
  logIn(opts).then((token) => {
    deals.forEach((dealToInsert) => {
      const ukefId = getIdFromNumberGenerator();

      const dealWithId = dealToInsert;
      dealWithId.ukefDealId = ukefId;

      insertGefDeal(dealWithId, opts, token).then((insertedDeal) => insertedDeal);
    });
  });
};
