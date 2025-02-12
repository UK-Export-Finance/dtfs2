const utilisationReportPage = {
  heading: () => cy.get('[data-cy="utilisation-report-reconciliation-for-report-heading"]'),
  reportPeriodHeading: () => cy.get('[data-cy="report-period-heading"]'),
  bankReportsNavLink: () => cy.get('a[data-cy="bank-reports-nav-link"]'),
  tabs: {
    keyingSheet: () => cy.get('a[data-cy="bank-report-tab-keying-sheet"]'),
    paymentDetails: () => cy.get('a[data-cy="bank-report-tab-payment-details"]'),
    premiumPayments: () => cy.get('a[data-cy="bank-report-tab-premium-payments"]'),
    utilisation: () => cy.get('a[data-cy="bank-report-tab-utilisation"]'),
    recordCorrectionLog: () => cy.get('a[data-cy="bank-report-tab-record-correction-log"]'),
    premiumPaymentsContent: {
      matchSuccessNotificationHeading: () => cy.get('[data-cy="match-success-notification-heading"]'),
      matchSuccessNotificationMessage: () => cy.get('[data-cy="match-success-notification-message"]'),
      selectPaymentsText: () => cy.get('[data-cy="select-payments-text"]'),
      paymentsOnPremiumPaymentsText: () => cy.get('[data-cy="payments-on-premium-payments-tab-text"]'),
      getPaymentLink: (paymentId) => cy.get(`a[data-cy="premium-payments-tab-edit-payment-link--paymentId-${paymentId}"]`),
      clickPaymentLink: (paymentId) => cy.get(`a[data-cy="premium-payments-tab-edit-payment-link--paymentId-${paymentId}"]`).click(),
      getFacilityIdFilterInput: () => cy.getInputByLabelText('Filter by facility ID'),
      submitFacilityIdFilter: () => cy.get('button[data-cy="premium-payments-facility-filter-submit-button"]').click(),
      generateKeyingDataButton: () => cy.get('[data-cy="generate-keying-data-button"]'),
      addAPaymentButton: () => cy.get('[data-cy="add-a-payment-button"]'),
      createRecordCorrectionRequestButton: () => cy.get('[data-cy="create-record-correction-request-button"]'),
      createRecordCorrectionRequestText: () => cy.get('[data-cy="how-to-create-record-correction-request-text"]'),
      receivedPaymentsText: () => cy.get('[data-cy="received-payments-text"]'),
      howToAddPaymentsText: () => cy.get('[data-cy="how-to-add-payments-text"]'),
      howToGenerateKeyingDataText: () => cy.get('[data-cy="how-to-generate-keying-data-text"]'),
      premiumPaymentsTable: {
        error: () => cy.get('[data-cy="premium-payments-table--error"]'),
        header: {
          totalReportedPayments: () => cy.get('th[data-cy="premium-payments-table--total-reported-payments-header"] button'),
          totalPaymentsReceived: () => cy.get('th[data-cy="premium-payments-table--total-payments-received-header"] button'),
          status: () => cy.get('th[data-cy="premium-payments-table--status-header"] button'),
        },
        row: (feeRecordId) => cy.get(`tr[data-cy*="premium-payments-table-row--feeRecordId-${feeRecordId}"]`),
        selectAllCheckboxContainer: () => cy.get('[data-cy="premium-payments-select-all-checkbox-container"]'),
        checkbox: (feeRecordIds, paymentCurrency, status) =>
          cy.get(`[type="checkbox"][id="feeRecordIds-${feeRecordIds.join(',')}-reportedPaymentsCurrency-${paymentCurrency}-status-${status}"]`),
        status: (feeRecordId) => cy.get(`[data-cy="premium-payments-table-row--feeRecordId-${feeRecordId}-status"]`),
        // NOTE: Using the ^= selector to match all table rows starting with the given data-cy value.
        rows: () => cy.get(`tr[data-cy^="premium-payments-table-row"]`),
        rowIndex: (index) => ({
          facilityId: () => cy.get('tr[data-cy^="premium-payments-table-row"]').eq(index).find('[data-cy="facility-id"]').first(),
        }),
        /**
         * NOTE: this selector should only be used with test data with unique exporters.
         * If fee record id is known then the preference is to use that selector as it has guaranteed uniqueness.
         */
        rowWithExporter: (exporter) => ({
          facilityId: () => cy.get(`tr[data-cy*="premium-payments-table-row--exporter-${exporter}"]`).find('[data-cy="facility-id"]'),
          exporter: () => cy.get(`tr[data-cy*="premium-payments-table-row--exporter-${exporter}"]`).find('[data-cy="exporter"]'),
          reportedFees: () => cy.get(`tr[data-cy*="premium-payments-table-row--exporter-${exporter}"]`).find('[data-cy="reported-fees"]'),
          reportedPayments: () => cy.get(`tr[data-cy*="premium-payments-table-row--exporter-${exporter}"]`).find('[data-cy="reported-payments"]'),
          totalReportedPayments: () => cy.get(`tr[data-cy*="premium-payments-table-row--exporter-${exporter}"]`).find('[data-cy="total-reported-payments"]'),
        }),
      },
    },
    keyingSheetContent: {
      markAsDoneButton: () => cy.get('[data-cy="keying-sheet-mark-as-done-button"]'),
      markAsToDoButton: () => cy.get('[data-cy="keying-sheet-mark-as-to-do-button"]'),
      keyingSheetTableRow: (feeRecordId) => cy.get(`[data-cy="keying-sheet-row-${feeRecordId}"]`),
      selectAllCheckbox: () => cy.get('#keying-sheet [data-cy="table-cell-checkbox--select-all"]'),
    },
    paymentDetailsContent: {
      paymentLinks: () => cy.get('[data-cy^="payment-details-tab-edit-payment-link"]'),
      clickPaymentLink: (paymentId) => cy.get(`a[data-cy="payment-details-tab-edit-payment-link--paymentId-${paymentId}"]`).click(),
      errorSummaryErrors: () => cy.get('[data-cy="payment-details-error-summary"] a'),
      paymentDetailsTable: {
        row: (paymentId, feeRecordId) => cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"]`),
        paymentCurrencyAndAmount: (paymentId, feeRecordId) =>
          cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"] td[data-cy="payment-currency-and-amount"]`),
        paymentReference: (paymentId, feeRecordId) =>
          cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"] td[data-cy="payment-reference"]`),
        facilityId: (paymentId, feeRecordId) =>
          cy.get(`[data-cy="payment-details-row--paymentId-${paymentId}-feeRecordId-${feeRecordId}"] td[data-cy="facility-id"]`),
      },
      filters: {
        panel: () => cy.get('[data-cy="payment-details--filters-panel"]'),
        panelToggleButton: () => cy.get('[data-cy="payment-details--filters-action-bar"] button'),
        submitButton: () => cy.get('[data-cy="payment-details--filters-submit-button"]'),
        facilityIdInput: () => cy.get('[data-cy="payment-details--filter-facility-id-input"]'),
        facilityIdError: () => cy.get('[data-cy="payment-details--filter-facility-id-error"]'),
        paymentReferenceInput: () => cy.get('[data-cy="payment-details--filter-payment-reference-input"]'),
        paymentReferenceError: () => cy.get('[data-cy="payment-details--filter-payment-reference-error"]'),
        paymentCurrencyRadioInput: (currencyCode) => cy.get(`input[type="radio"][data-cy="currency-${currencyCode}"]`),
        paymentCurrencyError: () => cy.get('[data-cy="payment-details--filter-payment-currency-error"]'),
        noRecordsMatchingFiltersText: () => cy.get('[data-cy="payment-details-no-records-matching-filters-text"]'),
        actionBar: () => cy.get('[data-cy="payment-details--filters-action-bar"]'),
        actionBarItem: (value) => cy.get(`[data-cy="payment-details--filters-action-bar"] a:contains(${value})`),
        clearFiltersLink: () => cy.get('a:contains("Clear filters")'),
        selectedFilter: (value) => cy.get(`[data-cy="payment-details--filters-panel"] .moj-filter__tag:contains(${value})`),
      },
    },
    utilisationContent: {
      downloadReportLink: () => cy.get('[data-cy="download-report-link"]'),
      table: {
        // NOTE: Using the ^= selector to match all table rows starting with the given data-cy value (regardless of the actual fee record id value).
        rows: () => cy.get(`tr[data-cy^="utilisation-table-row-"]`),
        /**
         * NOTE: this selector should only be used with test data with unique exporters.
         * If fee record id is known then the preference is to use that selector as it has guaranteed uniqueness.
         */
        rowWithExporter: (exporter) => ({
          facilityId: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="facility-id"]'),
          exporter: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="exporter"]'),
          baseCurrency: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="base-currency"]'),
          value: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="value"]'),
          utilisation: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="utilisation"]'),
          coverPercentage: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="cover-percentage"]'),
          exposure: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="exposure"]'),
          feesAccrued: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="fees-accrued"]'),
          feesPayable: () => cy.get(`tr[data-cy*="utilisation-table-row--exporter-${exporter}"]`).find('[data-cy="fees-payable"]'),
        }),
        rowIndex: (index) => ({
          facilityId: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="facility-id"]'),
          exporter: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="exporter"]'),
          baseCurrency: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="base-currency"]'),
          value: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="value"]'),
          utilisation: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="utilisation"]'),
          coverPercentage: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="cover-percentage"]'),
          exposure: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="exposure"]'),
          feesAccrued: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="fees-accrued"]'),
          feesPayable: () => cy.get('tr[data-cy^="utilisation-table-row"]').eq(index).find('[data-cy="fees-payable"]'),
        }),
        row: (feeRecordId) => ({
          facilityId: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="facility-id"]'),
          exporter: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="exporter"]'),
          baseCurrency: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="base-currency"]'),
          value: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="value"]'),
          utilisation: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="utilisation"]'),
          coverPercentage: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="cover-percentage"]'),
          exposure: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="exposure"]'),
          feesAccrued: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="fees-accrued"]'),
          feesPayable: () => cy.get(`tr[data-cy*="utilisation-table-row-${feeRecordId}"]`).find('[data-cy="fees-payable"]'),
        }),
        utilisationHeader: () => cy.get('[data-cy="utilisation-header"]'),
        valueHeader: () => cy.get('[data-cy="value-header"]'),
        exposureHeader: () => cy.get('[data-cy="exposure-header"]'),
      },
    },
    recordCorrectionLogContent: {
      heading: () => cy.get('[data-cy="record-correction-log-heading"]'),
      viewHistoricRecordCorrectionText: () => cy.get('[data-cy="view-historic-record-corrections-text"]'),
      recordCorrectionAutomaticallyNotifiedText: () => cy.get('[data-cy="record-correction-automatic-notification-text"]'),
      noRecordCorrectionsText: () => cy.get('[data-cy="no-record-corrections-text"]'),
      recordCorrectionLogTable: () => cy.get('[data-cy="record-correction-log-table"]'),
      table: {
        dateSentHeader: () => cy.get('[data-cy="record-correction-log-table-date-sent-header"]'),
        exporterHeader: () => cy.get('[data-cy="record-correction-log-table-exporter-header"]'),
        reasonsHeader: () => cy.get('[data-cy="record-correction-log-table-reasons-header"]'),
        correctRecordHeader: () => cy.get('[data-cy="record-correction-log-table-correct-record-header"]'),
        oldRecordHeader: () => cy.get('[data-cy="record-correction-log-table-old-record-header"]'),
        statusHeader: () => cy.get('[data-cy="record-correction-log-table-status-header"]'),
        row: (feeRecordId) => ({
          exporter: () => cy.get(`[data-cy="record-correction-log-table-row-${feeRecordId}-exporter"]`),
          reasons: () => cy.get(`[data-cy="record-correction-log-table-row-${feeRecordId}-reasons"]`),
          dateSent: () => cy.get(`[data-cy="record-correction-log-table-row-${feeRecordId}-date-sent"]`),
          correctRecord: () => cy.get(`[data-cy="record-correction-log-table-row-${feeRecordId}-correct-record"]`),
          oldRecord: () => cy.get(`[data-cy="record-correction-log-table-row-${feeRecordId}-old-record"]`),
          status: () => cy.get(`[data-cy="record-correction-log-table-row-${feeRecordId}-status"]`),
        }),
      },
    },
  },
};

module.exports = { utilisationReportPage };
