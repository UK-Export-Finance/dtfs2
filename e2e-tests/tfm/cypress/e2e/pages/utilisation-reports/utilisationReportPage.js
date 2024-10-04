const utilisationReportPage = {
  bankReportsNavLink: () => cy.get('a[data-cy="bank-reports-nav-link"]'),
  keyingSheetTabLink: () => cy.get('a[data-cy="bank-report-tab-keying-sheet"]'),
  paymentDetailsLink: () => cy.get('a[data-cy="bank-report-tab-payment-details"]'),
  premiumPaymentsTab: {
    selectPaymentsText: () => cy.get('[data-cy="select-payments-text"]'),
    paymentsOnPremiumPaymentsText: () => cy.get('[data-cy="payments-on-premium-payments-tab-text"]'),
    getPaymentLink: (paymentId) => cy.get(`a[data-cy="premium-payments-tab-edit-payment-link--paymentId-${paymentId}"]`),
    clickPaymentLink: (paymentId) => cy.get(`a[data-cy="premium-payments-tab-edit-payment-link--paymentId-${paymentId}"]`).click(),
    getFacilityIdFilterInput: () => cy.getInputByLabelText('Filter by facility ID'),
    submitFacilityIdFilter: () => cy.get('button[data-cy="premium-payments-facility-filter-submit-button"]').click(),
    generateKeyingDataButton: () => cy.get('[data-cy="generate-keying-data-button"]'),
    addAPaymentButton: () => cy.get('[data-cy="add-a-payment-button"]'),
    premiumPaymentsTable: {
      row: (feeRecordId) => cy.get(`tr[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`),
      checkbox: (feeRecordIds, paymentCurrency, status) =>
        cy.get(`[type="checkbox"][id="feeRecordIds-${feeRecordIds.join(',')}-reportedPaymentsCurrency-${paymentCurrency}-status-${status}"]`),
      status: (feeRecordId) => cy.get(`[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-status"]`),
    },
  },
  keyingSheetTab: {
    markAsDoneButton: () => cy.get('[data-cy="keying-sheet-mark-as-done-button"]'),
    markAsToDoButton: () => cy.get('[data-cy="keying-sheet-mark-as-to-do-button"]'),
    keyingSheetTableRow: (feeRecordId) => cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"]`),
    selectAllCheckbox: () => cy.get('#keying-sheet [data-cy="table-cell-checkbox--select-all"]'),
    fixedFeeAdjustmentIncrease: (feeRecordId) => cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"] td[data-cy="fixed-fee-adjustment--increase"]`),
    fixedFeeAdjustmentDecrease: (feeRecordId) => cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"] td[data-cy="fixed-fee-adjustment--decrease"]`),
    principalBalanceAdjustmentIncrease: (feeRecordId) =>
      cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"] td[data-cy="principal-balance-adjustment--increase"]`),
    principalBalanceAdjustmentDecrease: (feeRecordId) =>
      cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"] td[data-cy="principal-balance-adjustment--decrease"]`),
  },
  paymentDetailsTab: {
    clickPaymentLink: (paymentId) => cy.get(`a[data-cy="payment-details-tab-edit-payment-link--paymentId-${paymentId}"]`).click(),
    paymentDetailsTable: {
      row: (paymentId, feeRecordId) => cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"]`),
      paymentCurrencyAndAmount: (paymentId, feeRecordId) =>
        cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"] td[data-cy="payment-currency-and-amount"]`),
      paymentReference: (paymentId, feeRecordId) =>
        cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"] td[data-cy="payment-reference"]`),
      facilityId: (paymentId, feeRecordId) =>
        cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"] td[data-cy="facility-id"]`),
    },
  },
};

module.exports = { utilisationReportPage };
