const {listAllDeals, logIn, deleteDeal} = require('./api');

const deleteAllDeals = (token, deals, callback) => {
  const deleted = [];
  for (const dealToDelete of deals) {
    deleteDeal(token, dealToDelete, () => {
      deleted.push(dealToDelete);
      console.log(`deleted ${deleted.length} of ${deals.length}`)

      if (deleted.length  === deals.length) {
        callback && callback();
      }

    })
  };
}

module.exports =  (opts) => {
  console.log(`deleteAllDeals::`);

  logIn(opts, (token) => {
    listAllDeals(token, (deals) => {
      deleteAllDeals(token, deals, () => {
        cy.clearDeals(deals);
        console.log(`finished deleting`);
      });
    })
  });
}
