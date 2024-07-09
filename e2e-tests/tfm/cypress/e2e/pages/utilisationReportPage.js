const utilisationReportPage = {
  getPaymentLink: (paymentId) => cy.get(`a[data-cy="edit-payment-link--paymentId-${paymentId}"]`),
  clickPaymentLink: (paymentId) => cy.get(`a[data-cy="edit-payment-link--paymentId-${paymentId}"]`).click(),
  getPremiumPaymentsTableRow: (feeRecordId) => cy.get(`tr[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`),
  getFacilityIdFilterInput: () => cy.getInputByLabelText('Filter by facility ID'),
  submitFacilityIdFilter: () => cy.get('button[data-cy="facility-filter-submit-button"]').click(),
};

module.exports = { utilisationReportPage };
