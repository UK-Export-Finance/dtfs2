/* eslint-disable no-undef */
const companiesHouse = {
  captionHeading: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  form: () => cy.get('[data-cy="form"]'),
  regNumberField: () => cy.get('[data-cy="reg-number-field"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  summaryDetails: () => cy.get('[data-cy="summary-details"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  regNumberFieldError: () => cy.get('[data-cy="reg-number-field-error"]'),
};

export default companiesHouse;
