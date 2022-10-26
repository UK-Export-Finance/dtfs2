/* eslint-disable no-undef */
const facilities = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  headingCaption: () => cy.get('[data-cy="heading-caption"]'),
  hasBeenIssuedHeading: () => cy.get('[data-cy="has-been-issued-heading"]'),
  hasBeenIssuedError: () => cy.get('[data-cy="has-been-issued-error"]'),
  form: () => cy.get('[data-cy="form"]'),
  hasBeenIssuedRadioYesRadioButton: () => cy.get('[data-cy="has-been-issued-radio-yes"]'),
  hasBeenIssuedRadioNoRadioButton: () => cy.get('[data-cy="has-been-issued-radio-no"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

export default facilities;
