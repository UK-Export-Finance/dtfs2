/* eslint-disable no-undef */
const selectExportersCorAddress = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  postcodeTitle: () => cy.get('[data-cy="postcode-title"]'),
  postcode: () => cy.get('[data-cy="postcode"]'),
  form: () => cy.get('[data-cy="form"]'),
  selectAddress: () => cy.get('[data-cy="select-address"]'),
  selectAddressError: () => cy.get('[data-cy="select-address-error"]'),
  change: () => cy.get('[data-cy="change"]'),
  cantFindAddress: () => cy.get('[data-cy="cant-find-address"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
  changeDetails: () => cy.get('[data-cy="change-details"]'),
};

export default selectExportersCorAddress;
