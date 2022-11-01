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
  cantFindAddress: () => cy.get('[data-cy="cant-find-address"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  changeLink: () => cy.get('[data-cy="change-link"]'),
};

export default selectExportersCorAddress;
