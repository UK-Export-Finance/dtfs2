const utilisationReportEditPaymentPage = {
  saveChangesButton: () => cy.get('input[data-cy="save-changes-button"]'),
  deletePaymentButton: () => cy.get('a[data-cy="delete-payment-button"]'),
  feeRecordCheckbox: (feeRecordId) => cy.get(`[type="checkbox"][id="feeRecordId-${feeRecordId}"]`),
  removeSelectedFeesButton: () => cy.get('input[data-cy="remove-selected-fees-button"]'),
};

module.exports = { utilisationReportEditPaymentPage };
