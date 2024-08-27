const dashboardFilters = require('./dashboardFilters');
const dashboardSubNavigation = require('./dashboardSubNavigation');
const successMessage = require('./successMessage');
const ukefComments = require('./ukef-comments');
const taskListHeader = require('./taskListHeader');

module.exports = {
  cancelButton: () => cy.get('[data-cy="cancel-button"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  dashboardFilters,
  dashboardSubNavigation,
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  errorSummaryLinks: () => cy.get('.govuk-error-summary__list a'),
  mainHeading: () => cy.get('[data-cy="main-heading"]'),
  returnToMaker: () => cy.get('[data-cy="ReturnToMaker"]'),
  saveGoBackButton: () => cy.get('[data-cy="save-go-back-button"]'),
  submitButton: () => cy.get('[data-cy="submit-button"]'),
  successMessage,
  ukefComments,
  taskListHeader,
};
