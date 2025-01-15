const facilityValue = {
  facilityValue: () => cy.get('[data-cy="facility-value"]'),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  facilityValueInlineError: () => cy.get('[data-cy="facility-value-inline-error"]'),
};

module.exports = facilityValue;
