const {insertDeal, logIn} = require('./api');

const insertDeals = (token, deals, callback) => {
  const persisted = [];
  for (const dealToInsert of deals) {

    insertDeal(dealToInsert, token, (persistedDeal) => {
      persisted.push(persistedDeal);

      if (persisted.length  === deals.length) {
        callback(persisted);
      }

    })
  };
}

module.exports =  (deals, opts) => {
  console.log(`createManyDeals::`);

  logIn(opts, (token) => {
    insertDeals(token, deals, (insertedDeals) => {
      cy.cacheDeals(insertedDeals);
    })
  });
}
