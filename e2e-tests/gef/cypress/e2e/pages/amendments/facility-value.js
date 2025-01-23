const facilityValue = {
  facilityValue: () => cy.get('[data-cy="facility-value"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  facilityValueInlineError: () => cy.get('[data-cy="facility-value-inline-error"]'),
  pageHeading: () => cy.get('[data-cy="page-heading"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  facilityValuePrefix: () => cy.get('[data-cy="facility-value-prefix"]'),
};

module.exports = facilityValue;
