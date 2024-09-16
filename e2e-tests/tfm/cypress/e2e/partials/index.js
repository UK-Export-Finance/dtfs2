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
  errorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
};
