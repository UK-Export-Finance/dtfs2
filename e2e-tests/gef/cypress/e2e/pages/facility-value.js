/* eslint-disable no-undef */
const facilityValue = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  hiddenFacilityType: () => cy.get('[data-cy="hidden-facility-type"]'),
  value: () => cy.get('[data-cy="value"]'),
  valueLabel: () => cy.get('[data-cy="value-label"]'),
  valueError: () => cy.get('[data-cy="value-error"]'),
  valueSuffix: () => cy.get('[data-cy="value-suffix"]'),
  percentageCover: () => cy.get('[data-cy="percentage-cover"]'),
  percentageCoverError: () => cy.get('[data-cy="percentage-cover-error"]'),
  interestPercentage: () => cy.get('[data-cy="interest-percentage"]'),
  interestPercentageError: () => cy.get('[data-cy="interest-percentage-error"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'),
};

export default facilityValue;
