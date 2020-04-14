const page = {
  feeTypeAtMaturityInput: () => cy.get('[data-cy="fee-type-at-maturity"]'),
  feeFrequencyAnnuallyInput: () => cy.get('[data-cy="fee-frequency-annually"]'),
  dayCountBasis365Input: () => cy.get('[data-cy="day-count-basis-365"]'),
  submit: () => cy.get('button'),
};

module.exports = page;
