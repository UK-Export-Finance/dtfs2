const page = {
  title: () => cy.get('[data-cy="bond"]'),

  feeTypeInAdvanceInput: () => cy.get('[data-cy="fee-type-in-advance"]'),
  feeTypeAtMaturityInput: () => cy.get('[data-cy="fee-type-at-maturity"]'),
  feeTypeInputErrorMessage: () => cy.get('[data-cy="fee-type-error-message"]'),

  feeFrequencyAnnuallyInput: () => cy.get('[data-cy="in-advance-fee-frequency-radios"] [data-cy="fee-frequency-annually"]'),
  feeFrequencyInputErrorMessage: () => cy.get('[data-cy="fee-frequency-error-message"]'),

  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  dayCountBasisInputErrorMessage: () => cy.get('[data-cy="day-count-basis-error-message"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
