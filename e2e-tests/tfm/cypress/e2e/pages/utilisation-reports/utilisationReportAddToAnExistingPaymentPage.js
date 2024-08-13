const utilisationReportAddToAnExistingPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  availablePaymentGroups: () => cy.get('[data-cy="payment-group-radio-input"]'),
};

module.exports = { utilisationReportAddToAnExistingPaymentPage };
