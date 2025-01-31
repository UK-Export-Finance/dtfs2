const facilityEndDate = {
  facilityEndDateDay: () => cy.get('[data-cy="facility-end-date-day"]'),
  facilityEndDateMonth: () => cy.get('[data-cy="facility-end-date-month"]'),
  facilityEndDateYear: () => cy.get('[data-cy="facility-end-date-year"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  facilityEndDateInlineError: () => cy.get('[data-cy="facility-end-date-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = facilityEndDate;
