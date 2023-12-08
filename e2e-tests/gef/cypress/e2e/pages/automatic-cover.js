const automaticCover = {
  // Core elements
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  trueRadioButton: (id) => cy.get(`[data-cy="automatic-cover-true-${id}"]`),
  falseRadioButton: (id) => cy.get(`[data-cy="automatic-cover-false-${id}"]`),
  automaticCoverTerm: (id) => cy.get(`[data-cy="automatic-cover-term-${id}"]`),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),

  // Errors
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  fieldError: () => cy.get('[data-cy="automatic-cover-error"]'),
};

export default automaticCover;
