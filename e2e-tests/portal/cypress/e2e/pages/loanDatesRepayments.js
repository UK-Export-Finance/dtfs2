const page = {
  title: () => cy.get('[data-cy="loan"]'),

  premiumTypeInAdvanceInput: () => cy.get('[data-cy="premium-type-in-advance"]'),
  premiumTypeInArrearInput: () => cy.get('[data-cy="premium-type-in-arrear"]'),
  premiumTypeAtMaturityInput: () => cy.get('[data-cy="premium-type-at-maturity"]'),
  premiumTypeInputErrorMessage: () => cy.get('[data-cy="premium-type-error-message"]'),

  premiumFrequencyAnnuallyInput: () => cy.get('[data-cy="in-advance-premium-frequency-radios"] [data-cy="premium-frequency-annually"]'),
  premiumFrequencyQuarterlyInput: () => cy.get('[data-cy="in-arrear-premium-frequency-radios"] [data-cy="premium-frequency-quarterly"]'),
  premiumFrequencyInputErrorMessage: () => cy.get('[data-cy="premium-frequency-error-message"]'),

  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  dayCountBasisInputErrorMessage: () => cy.get('[data-cy="day-count-basis-error-message"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
