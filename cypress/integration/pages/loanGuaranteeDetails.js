const page = {
  facilityStageConditionalInput: () => cy.get('[data-cy="facility-stage-conditional"]'),
  facilityStageUnconditionalInput: () => cy.get('[data-cy="facility-stage-unconditional"]'),
  ukefGuaranteeInMonthsInput: () => cy.get('[data-cy="ukef-guarantee-in-months"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
