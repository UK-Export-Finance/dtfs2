const page = {
  premiumTypeInputErrorMessage: () => cy.get('[data-cy="fee-type-error-message"]'),

  premiumTypeInAdvanceInput: () => cy.get('[data-cy="fee-type-in-advance"]'),
  premiumTypeInAdvanceFrequencyAnnuallyInput: () => cy.get('[data-cy="inAdvance-frequency-annually"]'),
  premiumTypeAtMaturityInput: () => cy.get('[data-cy="fee-type-at-maturity"]'),

  frequencyInputErrorMessage: () => cy.get('[data-cy="frequency-error-message"]'),

  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  dayCountBasisInputErrorMessage: () => cy.get('[data-cy="day-count-basis-error-message"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
