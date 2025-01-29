const effectiveFrom = {
  effectiveFromDay: () => cy.get('[data-cy="effective-from-day"]'),
  effectiveFromMonth: () => cy.get('[data-cy="effective-from-month"]'),
  effectiveFromYear: () => cy.get('[data-cy="effective-from-year"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  effectiveFromInlineError: () => cy.get('[data-cy="effective-from-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = effectiveFrom;
