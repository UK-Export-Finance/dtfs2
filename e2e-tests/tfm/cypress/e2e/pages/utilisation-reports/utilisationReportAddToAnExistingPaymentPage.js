const utilisationReportAddToAnExistingPaymentPage = {
  selectedReportedFeesDetailsTable: () => cy.contains('table', 'Selected reported fees details'),
  availablePaymentGroups: () => cy.get('[data-cy="payment-groups"]'),
  paymentGroupRadioButton: (paymentGroupId) => cy.get(`input[id="${paymentGroupId}"]`),
};

module.exports = { utilisationReportAddToAnExistingPaymentPage };
