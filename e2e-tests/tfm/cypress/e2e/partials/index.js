const caseSubNavigation = require('./caseSubNavigation');
const caseSummary = require('./caseSummary');
const header = require('./header');
const underwritingSubNav = require('./underwritingSubNav');
const primaryNavigation = require('./primaryNavigation');

module.exports = {
  caseSubNavigation,
  caseSummary,
  header,
  underwritingSubNav,
  primaryNavigation,
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  errorSummaryListItems: () => cy.get('[data-cy="error-summary"] li'),
  // mainHeading: () => cy.get('[data-cy="main-heading"]'), // only 1 instance of this?   // there is "heading" though
  // saveAndReturnButton: () => cy.get('[data-cy="save-and-return-button"]'), // seems TFM does not have cancel buttons. check UI.
  submitButton: () => cy.get('[data-cy="submit-button"]'),
};

// continue-button

// we need  commands:
// cy.clickCancelLink
// cy.clickContinueButton
// cy.clickSubmitButton

// errorMessage ??
// errorSummaryItems
// commentErrorMessage
