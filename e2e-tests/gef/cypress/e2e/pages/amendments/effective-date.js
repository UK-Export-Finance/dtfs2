const effectiveDate = {
  effectiveDateDay: () => cy.get('[data-cy="effective-date-day"]'),
  effectiveDateMonth: () => cy.get('[data-cy="effective-date-month"]'),
  effectiveDateYear: () => cy.get('[data-cy="effective-date-year"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  effectiveDateInlineError: () => cy.get('[data-cy="effective-date-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = effectiveDate;
