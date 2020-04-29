const {insertDeal, logIn} = require('./api');

module.exports =  (deals, opts) => {
  console.log(`createManyDeals::`);

  logIn(opts).then( (token) => {
    const persisted = [];

    for (const dealToInsert of deals) {

      insertDeal(dealToInsert, token).then( (persistedDeal) => {
        persisted.push(persistedDeal);
        if (persisted.length === deals.length) {
          return persisted;
        }
      });

    };
  });
}
