const { insertDeal, getDeal, logIn } = require('./api');
const { getIdFromNumberGenerator } = require('../external-api/api');

module.exports = (deals, opts) => {
  console.info('createManyDeals::');

  return logIn(opts).then((token) => {
    const persistedDeals = [];

    cy.wrap(deals).each((dealToInsert) => {
      const ukefId = getIdFromNumberGenerator();

      const dealWithId = dealToInsert;
      dealWithId.details.ukefDealId = ukefId;
      dealWithId.submissionDetails['supplier-name'] = `Mock-Supplier-${ukefId}`;

      return insertDeal(dealWithId, token).then((insertedDeal) =>
        getDeal(insertedDeal._id, token).then((dealResponse) => {
          const persistedDeal = dealResponse?.deal || dealResponse;
          persistedDeals.push(persistedDeal);
        }),
      );
    });

    return cy.then(() => persistedDeals);
  });
};
