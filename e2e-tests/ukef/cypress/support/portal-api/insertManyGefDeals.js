const { insertGefDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (deals, userDetails) => {
  console.info('createManyGefDeals::');
  logIn(userDetails).then((token) => {
    deals.forEach((dealToInsert) => {
      const ukefId = getIdFromNumberGenerator();

      const dealWithId = dealToInsert;
      dealWithId.ukefDealId = ukefId;

      insertGefDeal(dealWithId, userDetails, token).then((insertedDeal) => insertedDeal);
    });
  });
};
