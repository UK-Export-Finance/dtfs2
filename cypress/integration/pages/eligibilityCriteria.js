const page = {
  eligibilityCriteriaItems: () => cy.get('[data-cy="eligibility-criteria-item"]'),
  eligibilityCriteriaItemsRadioButtons: {
    trueInput: () => cy.get('[data-cy="criteria-true"]'),
    falseInput: () => cy.get('[data-cy="criteria-false"]'),
  },
  eligibilityCriteria11ExtraInfo: () => cy.get('[data-cy="criteria-11-extra-info"]'),
  eligibilityCriteria11True: () => cy.get('[data-id="criteria-11-true"]'),
  eligibilityCriteria11False: () => cy.get('[data-id="criteria-11-false"]'),
  eligibilityCriteriaTrue: (question) => cy.get(`[data-id="criteria-${question}-true"]`),
  eligibilityCriteriaFalse: (question) => cy.get(`[data-id="criteria-${question}-false"]`),
  agentsName: {
    input: () => cy.get('[data-cy="agents-name-input"]'),
    count: () => cy.get('[data-cy="agents-name-count"]'),
  },
  agentsCountry: () => cy.get('[data-cy="agent-country"]'),
  nextPageButton: () => cy.get('[data-cy="next-page"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
  eligibiityProgressNav: {
    eligibilityCriteria: () => cy.get('[data-cy="progress-nav-item-link-eligibility/criteria"]'),
    supportingDocumentation: () => cy.get('[data-cy="progress-nav-item-link-eligibility/supporting-documentation"]'),
    preview: () => cy.get('[data-cy="progress-nav-item-link-eligibility/preview"]'),
  },
};

module.exports = page;
