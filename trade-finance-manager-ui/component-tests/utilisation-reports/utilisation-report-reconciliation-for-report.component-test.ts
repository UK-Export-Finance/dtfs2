import { FEE_RECORD_STATUS } from '@ukef/dtfs2-common';
import { PRIMARY_NAVIGATION_KEYS } from '../../server/constants';
import { pageRenderer } from '../pageRenderer';
import { aTfmSessionUser } from '../../test-helpers/test-data/tfm-session-user';
import { UtilisationReportReconciliationForReportViewModel } from '../../server/types/view-models';
import { TfmSessionUser } from '../../server/types/tfm-session-user';

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

  const params: UtilisationReportReconciliationForReportViewModel = {
    user: aTfmSessionUser(),
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
    bank,
    formattedReportPeriod,
    reportId: reportId.toString(),
    premiumPaymentsFilters,
    enablePaymentsReceivedSorting: false,
    premiumPayments: [],
    keyingSheet: [],
    paymentDetails: [],
  };

  const getWrapper = (viewModel: UtilisationReportReconciliationForReportViewModel = params) => render(viewModel);

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
        .toMatch(/Received payments are entered against reported fees through selection and then selection of the 'Add a payment' button./);
      wrapper
        .expectText(`[data-cy="how-to-generate-keying-data-text"]`)
        .toMatch(
          /When payments show as matched, the adjustment data for keying into ACBS will be automatically generated when the 'Generate keying data' button is selected./,
        );

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

    it('should render the premium payments with the relevant text for non-PDC_RECONCILE users', () => {
      const wrapper = getWrapper({ ...params, user: aPdcReadUser() });
      const premiumPaymentsTabSelector = 'div#premium-payments';

      wrapper.expectElement(premiumPaymentsTabSelector).toExist();
      wrapper
        .expectText(`[data-cy="received-payments-text"]`)
        .toMatch(
          /Received payments are entered against reported fees. When payments show as matched, the adjustment data for keying into ACBS will be automatically generated./,
        );

      wrapper.expectText(`[data-cy="how-to-add-payments-text"]`).notToExist();
      wrapper.expectText(`[data-cy="how-to-generate-keying-data-text"]`).notToExist();
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

    it('renders error when premiumPaymentsFilterError is provided', () => {
      const wrapper = getWrapper({ ...params, premiumPaymentsFilterError: { text: 'Oh no that is not correct', href: '#filter-component' } });
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
  });

  describe('keying sheet tab', () => {
    it('should render the keying sheet tab with headings, text, table and buttons for PDC_RECONCILE users', () => {
      const wrapper = getWrapper({ ...params, user: aPdcReconcileUser() });
      const keyingSheetTabSelector = 'div#keying-sheet';

      wrapper.expectElement(keyingSheetTabSelector).toExist();

      wrapper.expectText(`${keyingSheetTabSelector} h2[data-cy="keying-sheet-heading"]`).toRead('Keying sheet');
      wrapper.expectText(`[data-cy="select-payments-text"]`).toMatch(/Select payments and mark as done when the adjustments have been keyed into ACBS./);
      wrapper
        .expectText(`[data-cy="payments-on-premium-payments-tab-text"]`)
        .toMatch(/Payments on the premium payments tab will show as reconciled when they have been marked as done here./);

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
        .toMatch(/Payments on the premium payments tab will show as reconciled when they have been marked as done here./);

      wrapper.expectElement(`${keyingSheetTabSelector} form[data-cy="keying-sheet-form"]`).toExist();

      wrapper.expectElement(`${keyingSheetTabSelector} div.govuk-button-group`).notToExist();
      wrapper.expectElement(`${keyingSheetTabSelector} [data-cy="keying-sheet-mark-as-done-button"]`).notToExist();
      wrapper.expectElement(`${keyingSheetTabSelector} [data-cy="keying-sheet-mark-as-to-do-button"]`).notToExist();

      wrapper.expectElement(`${keyingSheetTabSelector} table[data-cy="keying-sheet-table"]`).toExist();
    });
  });

  describe('payment details tab', () => {
    it('should render the payment details tab with headings and text when the payment details array is empty', () => {
      const wrapper = getWrapper({ ...params, paymentDetails: [] });
      const paymentDetailsTabSelector = 'div#payment-details';

      wrapper.expectText(`${paymentDetailsTabSelector} h2[data-cy="payment-details-heading"]`).toRead('Payment details');
      wrapper
        .expectText(`${paymentDetailsTabSelector} p`)
        .toMatch(/Payment details will be displayed when payments have been entered on the premium payments tab./);
    });

    it('should render the payment details tab with headings (without text), the filters panel and the table when there are payment details', () => {
      const wrapper = getWrapper({
        ...params,
        paymentDetails: [
          {
            payment: {
              id: 1,
              amount: { formattedCurrencyAndAmount: 'GBP 100.00', dataSortValue: 0 },
              dateReceived: { formattedDateReceived: '1 Jan 2024', dataSortValue: 0 },
              reference: undefined,
            },
            feeRecords: [{ id: 1, facilityId: '12345678', exporter: 'Test exporter' }],
            feeRecordPaymentGroupStatus: FEE_RECORD_STATUS.DOES_NOT_MATCH,
            reconciledBy: '-',
            dateReconciled: { formattedDateReconciled: '-', dataSortValue: 0 },
          },
        ],
      });
      const paymentDetailsTabSelector = 'div#payment-details';

      wrapper.expectText(`${paymentDetailsTabSelector} h2[data-cy="payment-details-heading"]`).toRead('Payment details');
      wrapper.expectElement(`${paymentDetailsTabSelector} p`).notToExist();

      wrapper.expectElement(`${paymentDetailsTabSelector} [data-cy="payment-details--filters-panel"]`).toExist();
      wrapper.expectElement(`${paymentDetailsTabSelector} [data-cy="payment-details--filters-action-bar"]`).toExist();

      wrapper.expectElement(`${paymentDetailsTabSelector} table`).toExist();
    });
  });
});
