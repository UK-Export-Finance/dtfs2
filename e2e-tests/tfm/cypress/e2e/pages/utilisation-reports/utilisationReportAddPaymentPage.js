const utilisationReportAddPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  recordedPaymentsDetailsTable: () => cy.get('[data-cy="recorded-payments-details-table"]'),
  addFeesToAnExistingPaymentButton: () => cy.get('[data-cy="add-fees-to-an-existing-payment-button"]'),
};

module.exports = { utilisationReportAddPaymentPage };
