const partial = {
  ukefDealId: () => cy.get('[data-cy="ukef-deal-id"]'),
  exporterName: () => cy.get('[data-cy="exporter-name"]'),
  contractValue: () => cy.get('[data-cy="contract-value"]'),
  contractValueInGBP: () => cy.get('[data-cy="contract-value-in-gbp"]'),
  ukefProduct: () => cy.get('[data-cy="ukef-product"]'),
  ukefDealStage: () => cy.get('[data-cy="ukef-deal-stage-value"]'),
  dealSubmissionType: () => cy.get('[data-cy="submission-type"]'),
};

module.exports = partial;
