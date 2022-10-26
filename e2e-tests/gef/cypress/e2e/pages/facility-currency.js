/* eslint-disable no-undef */
const facilityCurrency = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  hiddenFacilityType: () => cy.get('[data-cy="hidden-facility-type"]'),
  currencyError: () => cy.get('[data-cy="currency-error"]'),
  yenCheckbox: () => cy.get('[data-cy="yen-checkbox"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  returnToApplicationButton: () => cy.get('[data-cy="return-to-application-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default facilityCurrency;
