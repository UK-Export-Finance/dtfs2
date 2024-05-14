module.exports = (deal, opts) => cy.insertManyDeals([deal], opts).then((inserted) => inserted[0]);
