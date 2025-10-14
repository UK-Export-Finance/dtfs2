const partial = {
  container: () => cy.get('[data-cy="case-summary"]'),
  ukefDealId: () => cy.get('[data-cy="ukef-deal-id"]'),
  exporterName: () => cy.get('[data-cy="exporter-name"]'),
  contractValue: () => cy.get('[data-cy="contract-value"]'),
  contractValueInGBP: () => cy.get('[data-cy="contract-value-in-gbp"]'),
  ukefProduct: () => cy.get('[data-cy="ukef-product"]'),
  ukefDealStage: () => cy.get('[data-cy="ukef-deal-stage-value"]'),
  dealSubmissionType: () => cy.get('[data-cy="submission-type"]'),
  totalExposure: () => cy.get('[data-cy="total-ukef-exposure"]'),
};

module.exports = partial;
