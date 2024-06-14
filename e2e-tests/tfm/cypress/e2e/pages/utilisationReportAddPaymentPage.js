const utilisationReportAddPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  recordedPaymentsDetailsTable: () => cy.get('[data-cy="recorded-payments-details-table"]'),
};

module.exports = { utilisationReportAddPaymentPage };
