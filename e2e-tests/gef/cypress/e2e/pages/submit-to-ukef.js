/* eslint-disable no-undef */
const submitToUkef = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  mainText: () => cy.get('[data-cy="main-text"]'),
  confirmSubmission: () => cy.get('[data-cy="confirm-submit-ukef"]'),
  confirmSubmissionCheckbox: () => cy.get('[data-cy="confirm-submit-ukef-checkbox"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
};

export default submitToUkef;
