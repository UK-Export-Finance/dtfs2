const {listAllDeals, logIn, deleteDeal} = require('./api');

const deleteAllDeals = (token, deals, callback) => {
  for (const dealToDelete of deals) {
    deleteDeal(token, dealToDelete);
  };
}

module.exports =  (opts) => {
  console.log(`deleteAllDeals::`);

  return logIn(opts).then( (token) => {
    return listAllDeals(token).then( (deals) => {

      return new Cypress.Promise((resolve, reject) => {
        deleteAllDeals(token, deals);
        cy.clearDeals(deals);
        resolve();
      })

    });
  });
}
