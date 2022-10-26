const page = {
  eligibilityCriteriaTitle: () => cy.get('[data-cy="eligibility"]'),
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
    count: () => cy.get('[id="agentName-info"]'),
  },
  eligibilityAgent: (criteria) => cy.get(`[data-cy="eligibility-agent-details-criteria-${criteria}"]`),
  agentsCountry: () => cy.get('[data-cy="agent-country"]'),
  nextPageButton: () => cy.get('[data-cy="next-page"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
