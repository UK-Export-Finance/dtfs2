/* eslint-disable no-undef */
const automaticCover = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  fieldError: () => cy.get('[data-cy="automatic-cover-error"]'),
  trueRadioButton: () => cy.get('[data-cy="automatic-cover-true"]'),
  falseRadioButton: () => cy.get('[data-cy="automatic-cover-false"]'),
  automaticCoverTerm: () => cy.get('[data-cy="automatic-cover-term"]'),
};

export default automaticCover;
