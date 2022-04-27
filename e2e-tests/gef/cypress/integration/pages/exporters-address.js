/* eslint-disable no-undef */
const automaticCover = {
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  companyNameTitle: () => cy.get('[data-cy="company-name-title"]'),
  registeredCompanyAddressTitle: () => cy.get('[data-cy="registered-company-address-title"]'),
  changeDetails: () => cy.get('[data-cy="change-details"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  postcodeError: () => cy.get('[data-cy="postcode-error"]'),
  fieldError: () => cy.get('[data-cy="correspondence-error"]'),
  yesRadioButton: () => cy.get('[data-cy="correspondence-yes"]'),
  noRadioButton: () => cy.get('[data-cy="correspondence-no"]'),
  correspondenceAddress: () => cy.get('[data-cy="correspondence-address"]'),
  manualAddressEntryLink: () => cy.get('[data-cy="enter-address-manually"]'),
};

export default automaticCover;
