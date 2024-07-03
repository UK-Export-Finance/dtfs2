const utilisationReportEditPaymentPage = {
  clickDeletePaymentButton: () => cy.get('a[data-cy="delete-payment-button"]').click(),
};

module.exports = { utilisationReportEditPaymentPage };
