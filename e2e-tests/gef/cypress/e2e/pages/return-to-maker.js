/* eslint-disable no-undef */
const returnToMaker = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  comment: () => cy.get('[data-cy="checker-comments"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
};

export default returnToMaker;
