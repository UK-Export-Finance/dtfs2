const utilisationReportPage = {
  bankReportsNavLink: () => cy.get('a[data-cy="bank-reports-nav-link"]'),
  keyingSheetTabLink: () => cy.get('a[data-cy="bank-report-tab-keying-sheet"]'),
  paymentDetailsLink: () => cy.get('a[data-cy="bank-report-tab-payment-details"]'),
  utilisationTabLink: () => cy.get('a[data-cy="bank-report-tab-utilisation"]'),
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
      header: {
        totalReportedPayments: () => cy.get('th[data-cy="premium-payments-table--total-reported-payments"] button'),
        totalPaymentsReceived: () => cy.get('th[data-cy="premium-payments-table--total-payments-received"] button'),
        status: () => cy.get('th[data-cy="premium-payments-table--status"] button'),
      },
      row: (feeRecordId) => cy.get(`tr[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}"]`),
      checkbox: (feeRecordIds, paymentCurrency, status) =>
        cy.get(`[type="checkbox"][id="feeRecordIds-${feeRecordIds.join(',')}-reportedPaymentsCurrency-${paymentCurrency}-status-${status}"]`),
      status: (feeRecordId) => cy.get(`[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-status"]`),
      // NOTE: Using the ^= selector to match all table rows starting with the given data-cy value (regardless of the actual fee record id value).
      facilityIdByRowIndex: (rowIndex) => cy.get('tr[data-cy^="premium-payments-table-row--feeRecordId-"]').eq(rowIndex).find('th').first(),
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
  utilisationTab: {
    table: {
      row: (feeRecordId) => cy.get(`tr[data-cy="utilisation-table-row-${feeRecordId}"]`),
      facilityId: () => cy.get('[data-cy="facility-id"]'),
      exporter: () => cy.get('[data-cy="exporter"]'),
      baseCurrency: () => cy.get('[data-cy="base-currency"]'),
      value: () => cy.get('[data-cy="value"]'),
      utilisation: () => cy.get('[data-cy="utilisation"]'),
      coverPercentage: () => cy.get('[data-cy="cover-percentage"]'),
      exposure: () => cy.get('[data-cy="exposure"]'),
      feesAccrued: () => cy.get('[data-cy="fees-accrued"]'),
      feesPayable: () => cy.get('[data-cy="fees-payable"]'),
    },
  },
};

module.exports = { utilisationReportPage };
