/* eslint-disable no-undef */
const providedFacility = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  form: () => cy.get('[data-cy="form"]'),
  hiddenFacilityType: () => cy.get('[data-cy="hidden-facility-type"]'),
  detailsOther: () => cy.get('[data-cy="details-other"]'),
  detailsOtherError: () => cy.get('[data-cy="details-other-error"]'),
  otherCheckbox: () => cy.get('[data-cy="other-checkbox"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default providedFacility;
