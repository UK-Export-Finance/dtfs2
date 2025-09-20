import { FEE_RECORD_STATUS, TfmSessionUser, UTILISATION_REPORT_STATUS_TAG_COLOURS } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../server/constants';
import { pageRenderer } from '../pageRenderer';
import { aTfmSessionUser } from '../../test-helpers/test-data/tfm-session-user';
import { UtilisationReportReconciliationForReportViewModel } from '../../server/types/view-models';
import { aUtilisationTableRowViewModel } from '../../test-helpers';

const page = '../templates/utilisation-reports/utilisation-report-reconciliation-for-report.njk';
const render = pageRenderer<UtilisationReportReconciliationForReportViewModel>(page);

describe(page, () => {
  const aPdcReconcileUser = (): TfmSessionUser => ({ ...aTfmSessionUser(), teams: ['PDC_RECONCILE'] });
  const aPdcReadUser = (): TfmSessionUser => ({ ...aTfmSessionUser(), teams: ['PDC_READ'] });

  const bank = {
    id: '123',
    name: 'Test Bank',
  };
  const formattedReportPeriod = 'Nov 2023';

  const reportId = 1;

  const premiumPaymentsFilters = {
    facilityId: '1234',
  };

  const downloadUrl = 'utilisation-reports/12345/download';
  const params: UtilisationReportReconciliationForReportViewModel = {
    user: aTfmSessionUser(),
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
    bank,
    formattedReportPeriod,
    reportId: reportId.toString(),
    premiumPayments: {
      payments: [],
      filters: premiumPaymentsFilters,
      showMatchSuccessNotification: false,
      hasSelectableRows: true,
      enablePaymentsReceivedSorting: false,
    },
    keyingSheet: [],
    paymentDetails: {
      rows: [],
      selectedFilters: null,
    },
    utilisationDetails: { utilisationTableRows: [], downloadUrl },
    isFeeRecordCorrectionFeatureFlagEnabled: true,
    recordCorrectionDetails: { recordCorrectionRows: [] },
    statusTagColours: UTILISATION_REPORT_STATUS_TAG_COLOURS,
  };

  const getWrapper = (viewModel: UtilisationReportReconciliationForReportViewModel = params) => render(viewModel);

  it('should have the correct integrity for "/assets/js/enableSelectAllTableCheckbox.js"', () => {
    const wrapper = getWrapper();

    wrapper
      .expectElement('script[src="/assets/js/enableSelectAllTableCheckbox.js"]')
      .toHaveAttribute('integrity', 'sha512-TIBIAXrIjjb/BgkLCMNJ3r2PgSoHWDmVWm5Ekefb1dLPI88KDbC+VxWl286sKbQNAdxzkG1y13Ks7tpg3rIC2A==');
  });

  it('should have the correct integrity for "/assets/js/mojFilterHide.js"', () => {
    const wrapper = getWrapper();

    wrapper
      .expectElement('script[src="/assets/js/mojFilterHide.js"]')
      .toHaveAttribute('integrity', 'sha512-JqMzZELzDQpgLMAB3966ecgcgxruf/JIJDMoBG7rIj+L9e+Ux+CyQ4FEGLIiVA2D8qbjbHKELyrdlpneaL+BfA==');
  });

  it('should not add error prefix to page title when there are no errors', () => {
    const wrapper = getWrapper();

    wrapper.expectPageTitle().toRead('Test Bank, Nov 2023');
  });

  it('should render the main heading', () => {
    const wrapper = getWrapper();
    wrapper.expectElement('[data-cy="utilisation-report-reconciliation-for-report-heading"]').toExist();
  });

  it('should render the report period heading', () => {
    const wrapper = getWrapper();
    wrapper.expectText('[data-cy="report-period-heading"]').toRead(`${formattedReportPeriod}`);
  });

  it.each`
    tabName               | dataCy                                | href
    ${'Premium payments'} | ${'bank-report-tab-premium-payments'} | ${'#premium-payments'}
    ${'Keying sheet'}     | ${'bank-report-tab-keying-sheet'}     | ${'#keying-sheet'}
    ${'Payment details'}  | ${'bank-report-tab-payment-details'}  | ${'#payment-details'}
    ${'Utilisation'}      | ${'bank-report-tab-utilisation'}      | ${'#utilisation'}
  `("should render the '$tabName' tab", ({ dataCy, tabName, href }: { dataCy: string; tabName: string; href: string }) => {
    const wrapper = getWrapper();
    const tabSelector = `[data-cy="${dataCy}"]`;
    wrapper.expectElement(tabSelector).toExist();
    wrapper.expectText(tabSelector).toRead(tabName);
    wrapper.expectElement(tabSelector).toHaveAttribute('href', href);
  });

  describe('premium payments tab', () => {
    it('should render the premium payments tab with headings, text, table and buttons', () => {
      const wrapper = getWrapper();
      const premiumPaymentsTabSelector = 'div#premium-payments';

      wrapper.expectElement(premiumPaymentsTabSelector).toExist();

      wrapper.expectText(`${premiumPaymentsTabSelector} h2[data-cy="premium-payments-heading"]`).toRead('Premium payments');
      wrapper
        .expectText(`[data-cy="how-to-add-payments-text"]`)
        .toRead("Received payments are entered against reported fees through selection and then selection of the 'Add a payment' button.");
      wrapper
        .expectText(`[data-cy="how-to-generate-keying-data-text"]`)
        .toRead(
          "When payments show as matched, the data for keying into ACBS will be automatically generated when the 'Generate keying data' button is selected.",
        );

      wrapper
        .expectText(`[data-cy="how-to-create-record-correction-request-text"]`)
        .toRead('If there is an error with the fee record, select the record to create a record correction request to send a query to the bank.');

      wrapper.expectText(`[data-cy="received-payments-text"]`).notToExist();

      wrapper.expectElement(`${premiumPaymentsTabSelector} form[data-cy="premium-payments-form"]`).toExist();

      wrapper.expectElement(`${premiumPaymentsTabSelector} div.govuk-button-group`).toExist();

      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="add-a-payment-button"]`).toExist();
      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="add-a-payment-button"]`).toHaveAttribute('value', 'Add a payment');
      wrapper
        .expectElement(`${premiumPaymentsTabSelector} input[data-cy="add-a-payment-button"]`)
        .toHaveAttribute('formaction', `/utilisation-reports/${reportId}/add-payment`);

      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="generate-keying-data-button"]`).toExist();
      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="generate-keying-data-button"]`).toHaveAttribute('value', 'Generate keying data');
      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="generate-keying-data-button"]`).hasClass('govuk-button--secondary');
      wrapper
        .expectElement(`${premiumPaymentsTabSelector} input[data-cy="generate-keying-data-button"]`)
        .toHaveAttribute('formaction', `/utilisation-reports/${reportId}/check-keying-data`);

      wrapper.expectElement(`${premiumPaymentsTabSelector} table[data-cy="premium-payments-table"]`).toExist();
    });

    it('should NOT render the text for creating a record correction request on the premium payments tab', () => {
      const wrapper = getWrapper({ ...params, isFeeRecordCorrectionFeatureFlagEnabled: false });

      wrapper.expectText(`[data-cy="how-to-create-record-correction-request-text"]`).notToExist();
    });

    it('should render the premium payments with the relevant text for non-PDC_RECONCILE users', () => {
      const wrapper = getWrapper({ ...params, user: aPdcReadUser() });
      const premiumPaymentsTabSelector = 'div#premium-payments';

      wrapper.expectElement(premiumPaymentsTabSelector).toExist();
      wrapper
        .expectText(`[data-cy="received-payments-text"]`)
        .toRead(
          'Received payments are entered against reported fees. When payments show as matched, the data for keying into ACBS will be automatically generated.',
        );

      wrapper
        .expectText(`[data-cy="how-to-create-record-correction-request-text"]`)
        .toRead('Errors with a fee record can be addressed and queried with the bank through a record correction request.');

      wrapper.expectText(`[data-cy="how-to-add-payments-text"]`).notToExist();
      wrapper.expectText(`[data-cy="how-to-generate-keying-data-text"]`).notToExist();
    });

    it('should NOT render the text for creating a record correction request on the premium payments tab for non-PDC_RECONCILE users', () => {
      const wrapper = getWrapper({ ...params, isFeeRecordCorrectionFeatureFlagEnabled: false, user: aPdcReadUser() });

      wrapper.expectText(`[data-cy="how-to-create-record-correction-request-text"]`).notToExist();
    });

    it('should render the facility ID filter input', () => {
      const wrapper = getWrapper();
      wrapper.expectElement('[data-cy="premium-payments-facility-filter-input"]').toExist();
      wrapper.expectText('[data-cy="facility-filter-form"]').toContain('Filter by facility ID');
    });

    it('initialises the filter input value to the premiumPaymentsFacilityId value', () => {
      const wrapper = getWrapper();
      wrapper.expectInput('[data-cy="premium-payments-facility-filter-input"]').toHaveValue(premiumPaymentsFilters.facilityId);
    });

    it('should render the facility ID filter submit button', () => {
      const wrapper = getWrapper();
      wrapper.expectElement('[data-cy="premium-payments-facility-filter-submit-button"]').toExist();
      wrapper.expectText('[data-cy="premium-payments-facility-filter-submit-button"]').toRead('Filter');
    });

    it('should render the facility ID filter clear button', () => {
      const wrapper = getWrapper();
      wrapper.expectElement('[data-cy="premium-payments-facility-filter-clear-button"]').toExist();
      wrapper.expectText('[data-cy="premium-payments-facility-filter-clear-button"]').toRead('Clear filter');
    });

    it('renders error when filterError is provided', () => {
      const wrapper = getWrapper({
        ...params,
        premiumPayments: {
          ...params.premiumPayments,
          filterError: { text: 'Oh no that is not correct', href: '#filter-component' },
        },
      });
      wrapper.expectText('[data-cy="facility-filter-form"]').toContain('Oh no that is not correct');
      wrapper.expectLink('[data-cy="error-summary"] a').toLinkTo('#filter-component', 'Oh no that is not correct');
    });

    it('should not render add payment button for PDC_READ user', () => {
      const wrapper = getWrapper({ ...params, user: aPdcReadUser() });

      const premiumPaymentsTabSelector = 'div#premium-payments';
      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="add-a-payment-button"]`).notToExist();
    });

    it('should not render generate keying data button for PDC_READ user', () => {
      const wrapper = getWrapper({
        ...params,
        user: aPdcReadUser(),
      });

      const premiumPaymentsTabSelector = 'div#premium-payments';
      wrapper.expectElement(`${premiumPaymentsTabSelector} input[data-cy="generate-keying-data-button"]`).notToExist();
    });

    describe('when isFeeRecordCorrectionFeatureFlagEnabled is false', () => {
      const paramsWithIsFeeRecordCorrectionFeatureFlagEnabledFalse = {
        ...params,
        isFeeRecordCorrectionFeatureFlagEnabled: false,
        user: aPdcReconcileUser(),
      };

      it('should not render the create record correction request button', () => {
        const wrapper = getWrapper(paramsWithIsFeeRecordCorrectionFeatureFlagEnabledFalse);

        wrapper.expectElement('[data-cy="create-record-correction-request-button"]').notToExist();
      });
    });

    describe('when isFeeRecordCorrectionFeatureFlagEnabled is true', () => {
      const paramsWithIsFeeRecordCorrectionFeatureFlagEnabledTrue = {
        ...params,
        isFeeRecordCorrectionFeatureFlagEnabled: true,
      };

      it('should render the create record correction request button for PDC_RECONCILE users', () => {
        const wrapper = getWrapper({
          ...paramsWithIsFeeRecordCorrectionFeatureFlagEnabledTrue,
          user: aPdcReconcileUser(),
        });

        wrapper.expectElement('[data-cy="create-record-correction-request-button"]').toExist();
      });

      it('should not render the create record correction request button for PDC_READ users', () => {
        const wrapper = getWrapper({
          ...paramsWithIsFeeRecordCorrectionFeatureFlagEnabledTrue,
          user: aPdcReadUser(),
        });

        wrapper.expectElement('[data-cy="create-record-correction-request-button"]').notToExist();
      });
    });

    it('should render edit actions within the premium payments table for PDC_RECONCILE users', () => {
      const wrapper = getWrapper({
        ...params,
        user: aPdcReconcileUser(),
      });

      wrapper.expectElement(`div#premium-payments input[type="checkbox"]`).toExist();
    });

    it('should not render edit actions within the premium payments table for PDC_READ users', () => {
      const wrapper = getWrapper({
        ...params,
        user: aPdcReadUser(),
      });

      wrapper.expectElement(`div#premium-payments input[type="checkbox"]`).notToExist();
    });

    it('should not display "match success notification" when param is false', () => {
      const wrapper = getWrapper({
        ...params,
        premiumPayments: {
          ...params.premiumPayments,
          showMatchSuccessNotification: false,
        },
      });

      wrapper.expectElement('[data-cy="match-success-notification"]').notToExist();
    });

    it('should display "match success notification" when param is true', () => {
      const wrapper = getWrapper({
        ...params,
        premiumPayments: {
          ...params.premiumPayments,
          showMatchSuccessNotification: true,
        },
      });

      wrapper.expectElement('[data-cy="match-success-notification"]').toExist();
      wrapper.expectText('[data-cy="match-success-notification-heading"]').toRead('Match payment recorded');
      wrapper
        .expectText('[data-cy="match-success-notification-message"]')
        .toRead('The fee(s) are now at a Match state. Further payments cannot be added to the fee record.');
    });

    it('should add error prefix to page title when there is a tableDataError', () => {
      const wrapper = getWrapper({
        ...params,
        premiumPayments: {
          ...params.premiumPayments,
          tableDataError: { text: 'some error', href: '#error-href' },
        },
      });

      wrapper.expectPageTitle().toRead('Error - Test Bank, Nov 2023');
    });

    it('should add error prefix to page title when there is a filterError', () => {
      const wrapper = getWrapper({
        ...params,
        premiumPayments: {
          ...params.premiumPayments,
          filterError: { text: 'some error', href: '#error-href' },
        },
      });

      wrapper.expectPageTitle().toRead('Error - Test Bank, Nov 2023');
    });
  });

  describe('keying sheet tab', () => {
    it('should render the keying sheet tab with headings, text, table and buttons for PDC_RECONCILE users', () => {
      const wrapper = getWrapper({ ...params, user: aPdcReconcileUser() });
      const keyingSheetTabSelector = 'div#keying-sheet';

      wrapper.expectElement(keyingSheetTabSelector).toExist();

      wrapper.expectText(`${keyingSheetTabSelector} h2[data-cy="keying-sheet-heading"]`).toRead('Keying sheet');
      wrapper.expectText(`[data-cy="select-payments-text"]`).toRead('Select payments and mark as done when they have been keyed into ACBS.');
      wrapper
        .expectText(`[data-cy="payments-on-premium-payments-tab-text"]`)
        .toRead('Payments on the premium payments tab will show as reconciled when they have been marked as done here.');

      wrapper.expectElement(`${keyingSheetTabSelector} form[data-cy="keying-sheet-form"]`).toExist();

      wrapper.expectElement(`${keyingSheetTabSelector} div.govuk-button-group`).toExist();

      const markAsDoneButtonSelector = `${keyingSheetTabSelector} [data-cy="keying-sheet-mark-as-done-button"]`;
      wrapper.expectInput(markAsDoneButtonSelector).toHaveValue('Mark as done');
      wrapper.expectElement(markAsDoneButtonSelector).toHaveAttribute('formaction', `/utilisation-reports/${reportId}/keying-data/mark-as-done`);
      wrapper.expectElement(markAsDoneButtonSelector).doesNotHaveClass('govuk-button--secondary');

      const markAsToDoButtonSelector = `${keyingSheetTabSelector} [data-cy="keying-sheet-mark-as-to-do-button"]`;
      wrapper.expectInput(markAsToDoButtonSelector).toHaveValue('Mark as to do');
      wrapper.expectElement(markAsToDoButtonSelector).toHaveAttribute('formaction', `/utilisation-reports/${reportId}/keying-data/mark-as-to-do`);
      wrapper.expectElement(markAsToDoButtonSelector).hasClass('govuk-button--secondary');

      wrapper.expectElement(`${keyingSheetTabSelector} table[data-cy="keying-sheet-table"]`).toExist();
    });

    it('should render the keying sheet tab with headings, text, table but not buttons for PDC_READ users', () => {
      const wrapper = getWrapper({ ...params, user: aPdcReadUser() });
      const keyingSheetTabSelector = 'div#keying-sheet';

      wrapper.expectElement(keyingSheetTabSelector).toExist();

      wrapper.expectText(`${keyingSheetTabSelector} h2[data-cy="keying-sheet-heading"]`).toRead('Keying sheet');
      wrapper.expectText('[data-cy="select-payments-text"]').notToExist();
      wrapper
        .expectText('[data-cy="payments-on-premium-payments-tab-text"]')
        .toRead('Payments on the premium payments tab will show as reconciled when they have been marked as done here.');

      wrapper.expectElement(`${keyingSheetTabSelector} form[data-cy="keying-sheet-form"]`).toExist();

      wrapper.expectElement(`${keyingSheetTabSelector} div.govuk-button-group`).notToExist();
      wrapper.expectElement(`${keyingSheetTabSelector} [data-cy="keying-sheet-mark-as-done-button"]`).notToExist();
      wrapper.expectElement(`${keyingSheetTabSelector} [data-cy="keying-sheet-mark-as-to-do-button"]`).notToExist();

      wrapper.expectElement(`${keyingSheetTabSelector} table[data-cy="keying-sheet-table"]`).toExist();
    });
  });

  describe('payment details tab', () => {
    it('should render the payment details tab with headings and text when the payment details rows array is empty', () => {
      const wrapper = getWrapper({ ...params, paymentDetails: { rows: [], isFilterActive: false, selectedFilters: null } });
      const paymentDetailsTabSelector = 'div#payment-details';

      wrapper.expectText(`${paymentDetailsTabSelector} h2[data-cy="payment-details-heading"]`).toRead('Payment details');
      wrapper
        .expectText(`${paymentDetailsTabSelector} p[data-cy="payment-details-no-payments-text"]`)
        .toRead('Payment details will be displayed when payments have been entered on the premium payments tab.');
      wrapper.expectElement(`${paymentDetailsTabSelector} p[data-cy="payment-details-no-records-matching-filters-text"]`).notToExist();
    });

    it('should render the payment details tab with headings and no records matching filters text when the payment details rows array is empty and the filter is active', () => {
      const wrapper = getWrapper({ ...params, paymentDetails: { rows: [], isFilterActive: true, selectedFilters: null } });
      const paymentDetailsTabSelector = 'div#payment-details';

      wrapper.expectText(`${paymentDetailsTabSelector} h2[data-cy="payment-details-heading"]`).toRead('Payment details');
      wrapper
        .expectText(`${paymentDetailsTabSelector} p[data-cy="payment-details-no-records-matching-filters-text"]`)
        .toRead('There are no records matching the search criteria');
      wrapper.expectElement(`${paymentDetailsTabSelector} p[data-cy="payment-details-no-payments-text"]`).notToExist();
    });

    it('should render the payment details tab with headings (without text), the filters panel and the table when there are payment details', () => {
      const wrapper = getWrapper({
        ...params,
        paymentDetails: {
          rows: [
            {
              payment: {
                id: 1,
                amount: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
                dateReceived: { formattedDateReceived: '1 Jan 2024', dataSortValue: 0 },
              },
              feeRecords: [{ id: 1, facilityId: '12345678', exporter: 'Test exporter' }],
              status: FEE_RECORD_STATUS.DOES_NOT_MATCH,
              reconciledBy: '-',
              dateReconciled: { formattedDateReconciled: '-', dataSortValue: 0 },
            },
          ],
          selectedFilters: null,
        },
      });
      const paymentDetailsTabSelector = 'div#payment-details';

      wrapper.expectText(`${paymentDetailsTabSelector} h2[data-cy="payment-details-heading"]`).toRead('Payment details');
      wrapper.expectElement(`${paymentDetailsTabSelector} p`).notToExist();

      wrapper.expectElement(`${paymentDetailsTabSelector} [data-cy="payment-details--filters-panel"]`).toExist();
      wrapper.expectElement(`${paymentDetailsTabSelector} [data-cy="payment-details--filters-action-bar"]`).toExist();

      wrapper.expectElement(`${paymentDetailsTabSelector} table`).toExist();
    });

    it('should render error summary when present', () => {
      const wrapper = getWrapper({
        ...params,
        paymentDetails: {
          rows: [],
          filterErrors: {
            errorSummary: [
              { text: "You've done something wrong", href: '#id' },
              { text: "You've done another thing wrong", href: '#other' },
            ],
          },
          selectedFilters: null,
        },
      });

      wrapper.expectElement('a[href="#id"]').toExist();
      wrapper.expectText('a[href="#id"]').toRead("You've done something wrong");
      wrapper.expectElement('a[href="#other"]').toExist();
      wrapper.expectText('a[href="#other"]').toRead("You've done another thing wrong");
    });

    it('should add error prefix to page title when there is a filter error', () => {
      const wrapper = getWrapper({
        ...params,
        paymentDetails: {
          ...params.paymentDetails,
          filterErrors: {
            errorSummary: [{ text: 'some error', href: '#error-href' }],
          },
        },
      });

      wrapper.expectPageTitle().toRead('Error - Test Bank, Nov 2023');
    });
  });

  describe('utilisation tab', () => {
    it('should render the utilisation tab header', () => {
      const wrapper = getWrapper();

      const utilisationTabSelector = 'div#utilisation';

      wrapper.expectText(`${utilisationTabSelector} h2[data-cy="bank-report-heading"]`).toRead('Bank report');
    });

    it('should render the utilisation tab table', () => {
      const feeRecordId = 12;
      const wrapper = getWrapper({
        ...params,
        utilisationDetails: {
          utilisationTableRows: [
            {
              ...aUtilisationTableRowViewModel(),
              feeRecordId,
            },
          ],
          downloadUrl,
        },
      });

      const utilisationTabSelector = 'div#utilisation';

      wrapper.expectElement(`${utilisationTabSelector} table`).toExist();
      wrapper.expectElement(`${utilisationTabSelector} table tr[data-cy="utilisation-table-row-${feeRecordId}"]`);
    });

    it('should render the download link for the report', () => {
      const wrapper = getWrapper({
        ...params,
        utilisationDetails: {
          utilisationTableRows: [aUtilisationTableRowViewModel()],
          downloadUrl,
        },
      });

      wrapper.expectLink('[data-cy="download-report-link"]').toLinkTo(downloadUrl, 'Download the report submitted by the bank as a CSV');
    });
  });
});
