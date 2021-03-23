/* eslint-disable no-undef */
const enterExportersCorAddress = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backButton: () => cy.get('[data-cy="back-button"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  addressLine1: () => cy.get('[data-cy="address-line-1"]'),
  addressLine2: () => cy.get('[data-cy="address-line-2"]'),
  addressLine3: () => cy.get('[data-cy="address-line-3"]'),
  addressLine1Error: () => cy.get('[data-cy="address-line-1-error"]'),
  postcodeError: () => cy.get('[data-cy="postcode-error"]'),
  locality: () => cy.get('[data-cy="locality"]'),
  postcode: () => cy.get('[data-cy="postcode"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
};

export default enterExportersCorAddress;
