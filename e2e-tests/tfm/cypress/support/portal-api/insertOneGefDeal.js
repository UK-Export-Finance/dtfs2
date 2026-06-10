module.exports = (deal, opts) => {
  return cy.insertManyGefDeals([deal], opts).then((insertedDeals) => insertedDeals[0]);
};
