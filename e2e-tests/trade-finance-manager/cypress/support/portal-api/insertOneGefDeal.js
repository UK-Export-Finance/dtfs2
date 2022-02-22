module.exports = (deal, opts) => {
  cy.insertManyGefDeals([deal], opts)
    .then((insertedDeals) => insertedDeals[0]);
};
