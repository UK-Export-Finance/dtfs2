const page = {
  eligibilityCriteriaItems: () => cy.get('[data-cy="eligibility-criteria-item"]'),
  eligibilityCriteriaItemsRadioButtons: () => cy.get('[data-cy="eligibility-criteria-item"] input[type="radio"]'),
};

module.exports = page;
