const utilisationReportEditPaymentPage = {
  errorSummary: () => cy.get('[data-cy="error-summary"]'),
  clickSaveChangesButton: () => cy.get('input[data-cy="save-changes-button"]').click(),
  clickDeletePaymentButton: () => cy.get('a[data-cy="delete-payment-button"]').click(),
  clickRemoveSelectedPaymentsButton: () => cy.get('input[data-cy="remove-selected-fees-button"]').click(),
  clickBackLink: () => cy.get('[data-cy="back-link"]').click(),
};

module.exports = { utilisationReportEditPaymentPage };
