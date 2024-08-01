const utilisationReportPage = {
  bankReportsNavLink: () => cy.get('a[data-cy="bank-reports-nav-link"]'),
  keyingSheetTabLink: () => cy.get('a[data-cy="bank-report-tab-keying-sheet"]'),
  premiumPaymentsTab: {
    getPaymentLink: (paymentId) => cy.get(`a[data-cy="edit-payment-link--paymentId-${paymentId}"]`),
    clickPaymentLink: (paymentId) => cy.get(`a[data-cy="edit-payment-link--paymentId-${paymentId}"]`).click(),
    getPremiumPaymentsTableRow: (feeRecordId) => cy.get(`tr[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`),
    getFacilityIdFilterInput: () => cy.getInputByLabelText('Filter by facility ID'),
    submitFacilityIdFilter: () => cy.get('button[data-cy="facility-filter-submit-button"]').click(),
    generateKeyingDataButton: () => cy.get('[data-cy="generate-keying-data-button"]'),
  },
  keyingSheetTab: {
    markAsDoneButton: () => cy.get('[data-cy="keying-sheet-mark-as-done-button"]'),
    markAsToDoButton: () => cy.get('[data-cy="keying-sheet-mark-as-to-do-button"]'),
    keyingSheetTableRow: (feeRecordId) => cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"]`),
    selectAllCheckbox: () => cy.get('#keying-sheet [data-cy="table-cell-checkbox--select-all"]'),
  },
};

module.exports = { utilisationReportPage };
