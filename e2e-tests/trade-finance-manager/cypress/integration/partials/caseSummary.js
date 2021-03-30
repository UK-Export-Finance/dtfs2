const partial = {
  ukefDealId: () => cy.get('[data-cy="ukef-deal-id"]'),
  supplierName: () => cy.get('[data-cy="supplier-name"]'),
  contractValue: () => cy.get('[data-cy="contract-value"]'),
  contractValueInGBP: () => cy.get('[data-cy="contract-value-in-gbp"]'),
  ukefDealStage: () => cy.get('[data-cy="ukef-deal-stage-value"]'),
};

module.exports = partial;
