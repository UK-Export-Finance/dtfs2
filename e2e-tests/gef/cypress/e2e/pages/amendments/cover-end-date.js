const coverEndDate = {
  coverEndDateDay: () => cy.get('[data-cy="cover-end-date-day"]'),
  coverEndDateMonth: () => cy.get('[data-cy="cover-end-date-month"]'),
  coverEndDateYear: () => cy.get('[data-cy="cover-end-date-year"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  coverEndDateInlineError: () => cy.get('[data-cy="cover-end-date-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = coverEndDate;
