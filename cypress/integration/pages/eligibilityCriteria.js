const page = {
  eligibilityCriteriaItems: () => cy.get('[data-cy="eligibility-criteria-item"]'),
  eligibilityCriteriaItemsRadioButtons: {
    trueInput: () => cy.get('[data-cy="criteria-true"]'),
    falseInput: () => cy.get('[data-cy="criteria-false"]'),
  },
  nextPageButton: () => cy.get('[data-cy="next-page"]'),
};

module.exports = page;
