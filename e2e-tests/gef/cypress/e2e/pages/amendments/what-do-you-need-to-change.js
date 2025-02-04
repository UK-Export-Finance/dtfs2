const whatDoYouNeedToChange = {
  coverEndDateCheckbox: () => cy.get('[data-cy="cover-end-date-checkbox"]'),
  facilityValueCheckbox: () => cy.get('[data-cy="facility-value-checkbox"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  amendmentOptionsInlineError: () => cy.get('[data-cy="amendment-options-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  warning: () => cy.get('[data-cy="warning"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = whatDoYouNeedToChange;
