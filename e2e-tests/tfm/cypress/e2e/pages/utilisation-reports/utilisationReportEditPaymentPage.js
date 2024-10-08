const utilisationReportEditPaymentPage = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  clickSaveChangesButton: () => cy.get('input[data-cy="save-changes-button"]').click(),
  clickDeletePaymentButton: () => cy.get('a[data-cy="delete-payment-button"]').click(),
  clickRemoveSelectedPaymentsButton: () => cy.get('input[data-cy="remove-selected-fees-button"]').click(),
};

module.exports = { utilisationReportEditPaymentPage };
