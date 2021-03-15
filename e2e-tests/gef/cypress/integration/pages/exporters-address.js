/* eslint-disable no-undef */
const automaticCover = {
  backButton: () => cy.get('[data-cy="back-button"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  companyNameTitle: () => cy.get('[data-cy="company-name-title"]'),
  registeredCompanyAddressTitle: () => cy.get('[data-cy="registered-company-address-title"]'),
  changeDetails: () => cy.get('[data-cy="change-details"]'),
  // form: () => cy.get('[data-cy="form"]'),
  // continueButton: () => cy.get('[data-cy="continue-button"]'),
  // saveGoBackLink: () => cy.get('[data-cy="save-go-back-link"]'),
  // errorSummary: () => cy.get('[data-cy="error-summary"]'),
  // fieldError: () => cy.get('[data-cy="automatic-cover-error"]'),
  yesRadioButton: () => cy.get('[data-cy="correspondence-yes"]'),
  noRadioButton: () => cy.get('[data-cy="correspondence-no"]'),
  // automaticCoverTerm: () => cy.get('[data-cy="automatic-cover-term"]'),
};

export default automaticCover;
