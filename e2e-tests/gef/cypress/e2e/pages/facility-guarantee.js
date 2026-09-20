const facilityGuarantee = {
  feeTypeInAdvanceInput: () => cy.get('[data-cy="fee-type-in-advance"]'),
  feeTypeInArrearsInput: () => cy.get('[data-cy="fee-type-in-arrears"]'),
  feeTypeAtMaturityInput: () => cy.get('[data-cy="fee-type-at-maturity"]'),
  feeTypeInputErrorMessage: () => cy.get('[data-cy="fee-type-error-message"]'),

  feeFrequencyAnnuallyInput: () => cy.get('[data-cy="frequency-annually"]'),
  feeFrequencySemiAnnuallyInput: () => cy.get('[data-cy="frequency-semi-annually"]'),
  feeFrequencyQuarterlyInput: () => cy.get('[data-cy="frequency-quarterly"]'),
  feeFrequencyMonthlyInput: () => cy.get('[data-cy="frequency-monthly"]'),
  feeFrequencyInputErrorMessage: () => cy.get('[data-cy="fee-frequency-error-message"]'),

  dayCountBasis360Input: () => cy.get('[data-cy="day-count-basis-360"]'),
  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  dayCountBasisInputErrorMessage: () => cy.get('[data-cy="day-count-basis-error-message"]'),

  doneButton: () => cy.get('[data-cy="done-button"]'),
};

export default facilityGuarantee;
