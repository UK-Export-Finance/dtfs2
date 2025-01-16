const whatDoYouNeedToChange = {
  coverEndDateCheckbox: () => cy.get('[data-cy="cover-end-date-checkbox"]'),
  facilityValueCheckbox: () => cy.get('[data-cy="facility-value-checkbox"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  selectionErrorMessage: () => cy.get('[data-cy="selection-error-message"]'),
  pageTitle: () => cy.get('[data-cy="page-title"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  warning: () => cy.get('[data-cy="warning"]'),
};

module.exports = whatDoYouNeedToChange;
