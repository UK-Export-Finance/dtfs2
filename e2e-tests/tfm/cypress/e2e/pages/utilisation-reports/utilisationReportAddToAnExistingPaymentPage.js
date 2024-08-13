const utilisationReportAddToAnExistingPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  availablePaymentGroups: () => cy.get('[data-cy="payment-group-radio-input"]'),
  continueButton: () => cy.get('[data-cy="continue-button"]'),
};

module.exports = { utilisationReportAddToAnExistingPaymentPage };
