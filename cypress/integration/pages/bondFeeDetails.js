const page = {
  feeTypeInputErrorMessage: () => cy.get('[data-cy="fee-type-error-message"]'),

  feeTypeInAdvanceInput: () => cy.get('[data-cy="fee-type-in-advance"]'),
  feeTypeInAdvanceFeeFrequencyAnnuallyInput: () => cy.get('[data-cy="inAdvance-fee-frequency-annually"]'),

  feeFrequencyInputErrorMessage: () => cy.get('[data-cy="fee-frequency-error-message"]'),

  feeTypeAtMaturityInput: () => cy.get('[data-cy="fee-type-at-maturity"]'),

  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  dayCountBasisInputErrorMessage: () => cy.get('[data-cy="day-count-basis-error-message"]'),

  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
