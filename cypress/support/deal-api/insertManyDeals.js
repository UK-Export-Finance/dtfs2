const {insertDeal, logIn} = require('./api');

const insertDeals = (token, deals, callback) => {
  const persisted = [];
  for (const dealToInsert of deals) {
    insertDeal(dealToInsert, token).then( (persistedDeal) => {
      persisted.push(persistedDeal);
    });
  };

  return persisted;
}

module.exports =  (deals, opts) => {
  console.log(`createManyDeals::`);

  return logIn(opts).then( (token) => {

    return new Cypress.Promise((resolve, reject) => {
      const insertedDeals = insertDeals(token, deals);
      cy.cacheDeals(insertedDeals);
      resolve(insertedDeals);
    });

  });
}
