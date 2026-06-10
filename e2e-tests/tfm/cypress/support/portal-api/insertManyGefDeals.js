const { insertGefDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (deals, opts) => {
  console.info('createManyGefDeals::');

  return logIn(opts).then((token) => {
    const persistedDeals = [];

    cy.wrap(deals).each((dealToInsert) => {
      const ukefId = getIdFromNumberGenerator();

      const dealWithId = {
        ...dealToInsert,
        ukefDealId: ukefId,
      };

      return insertGefDeal(dealWithId, opts, token).then((insertedDeal) => {
        persistedDeals.push(insertedDeal);
      });
    });

    return cy.then(() => persistedDeals);
  });
};
