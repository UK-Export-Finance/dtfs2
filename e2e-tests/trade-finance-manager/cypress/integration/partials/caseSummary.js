const partial = {
  ukefDealId: () => cy.get('[data-cy="ukef-deal-id"]'),
  supplierName: () => cy.get('[data-cy="supplier-name"]'),
};

module.exports = partial;
