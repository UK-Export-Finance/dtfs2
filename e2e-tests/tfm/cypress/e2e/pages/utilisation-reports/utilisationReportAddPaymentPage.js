const utilisationReportAddPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  recordedPaymentsDetailsTable: () => cy.get('[data-cy="recorded-payments-details-table"]'),
  addFeesToAnExistingPaymentButton: () => cy.get('[data-cy="add-fees-to-an-existing-payment-button"]'),
  insetToleranceText: () => cy.get('[data-cy="inset-tolerance-text"]'),
};

module.exports = { utilisationReportAddPaymentPage };
