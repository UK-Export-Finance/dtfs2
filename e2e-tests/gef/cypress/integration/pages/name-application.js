/* eslint-disable no-undef */
const nameApplication = {
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  internalRef: () => cy.get('[data-cy="internal-ref"]'),
  additionalRef: () => cy.get('[data-cy="additional-ref"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel"]'),
  form: () => cy.get('[data-cy="form"]'),
  formError: () => cy.get('[data-cy="internal-ref-error"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  firstErrorLink: () => cy.get('[data-cy="error-summary"]').first('a'),
  applicationDetailsPage: () => cy.get('[data-cy="application-details-page"]'),
};

export default nameApplication;
