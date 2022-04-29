const amendmentsRequestPage = {
  amendmentRequestHeading: () => cy.get('[data-cy="amendment-request-heading"]'),
  amendmentRequestHint: () => cy.get('[data-cy="amendments-request-hint"]'),
  amendmentRequestDayInput: () => cy.get('[data-cy="amendment-request-date-day"]'),
  amendmentRequestMonthInput: () => cy.get('[data-cy="amendment-request-date-month"]'),
  amendmentRequestYearInput: () => cy.get('[data-cy="amendment-request-date-year"]'),

  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  errorMessage: () => cy.get('[data-cy="amendment-request-date-error"]'),

  continueButton: () => cy.get('[data-cy="continue-button"]'),
  cancelLink: () => cy.get('[data-cy="cancel-button"]'),

};

module.exports = amendmentsRequestPage;
