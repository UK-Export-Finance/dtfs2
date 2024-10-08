module.exports = (deal, opts) => {
  cy.insertManyDeals([deal], opts).then((insertedDeals) => insertedDeals[0]);
};
