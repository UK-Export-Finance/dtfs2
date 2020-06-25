const page = {
  premiumTypeInAdvanceInput: () => cy.get('[data-cy="premium-type-in-advance"]'),
  premiumTypeAtMaturityInput: () => cy.get('[data-cy="premium-type-at-maturity"]'),
  premiumTypeInputErrorMessage: () => cy.get('[data-cy="premium-type-error-message"]'),

  premiumFrequencyAnnuallyInput: () => cy.get('[data-cy="premium-frequency-annually"]'),
  premiumFrequencyInputErrorMessage: () => cy.get('[data-cy="premium-frequency-error-message"]'),

  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  dayCountBasisInputErrorMessage: () => cy.get('[data-cy="day-count-basis-error-message"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
