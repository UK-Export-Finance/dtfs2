const page = {
  feeTypeInAdvanceInput: () => cy.get('[data-cy="fee-type-in-advance"]'),
  feeTypeInAdvanceFeeFrequencyAnnuallyInput: () => cy.get('[data-cy="inAdvanceFeeFrequency-annually"]'),

  feeTypeInArrearInput: () => cy.get('[data-cy="fee-type-in-arrear"]'),

  feeTypeAtMaturityInput: () => cy.get('[data-cy="fee-type-at-maturity"]'),
  feeTypeAtMaturityFeeFrequencyRadioGroup: () => cy.get('[data-cy="atMaturity-radio-group"]'),

  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  submit: () => cy.get('[data-cy="submit-button"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
};

module.exports = page;
