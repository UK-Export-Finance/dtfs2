const page = {
  eligibilityCriteriaItems: () => cy.get('[data-cy="eligibility-criteria-item"]'),
  eligibilityCriteriaItemsRadioButtons: {
    trueInput: () => cy.get('[data-cy="criteria-true"]'),
    falseInput: () => cy.get('[data-cy="criteria-false"]'),
  },
  eligibilityCriteria11ExtraInfo: () => cy.get('[data-cy="criteria-11-extra-info"]'),
  eligibilityCriteria11True: () => cy.get('[data-id="criteria-11-true"]'),
  eligibilityCriteria11False: () => cy.get('[data-id="criteria-11-false"]'),
  nextPageButton: () => cy.get('[data-cy="next-page"]'),
};

module.exports = page;
