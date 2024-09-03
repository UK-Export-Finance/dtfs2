const utilisationReportAddToAnExistingPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  availablePaymentGroups: () => cy.get('[data-cy="payment-groups"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
  paymentGroupRadioButton: (paymentGroupId) => cy.get(`input[id="${paymentGroupId}"]`),
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  backLink: () => cy.get('[data-cy="back-link"]'),
  cancelLink: () => cy.get('[data-cy="cancel-link"]'),
};

module.exports = { utilisationReportAddToAnExistingPaymentPage };
