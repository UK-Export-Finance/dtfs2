const { PRIMARY_NAVIGATION_KEYS } = require('../../server/constants');
const pageRenderer = require('../pageRenderer');

const page = '../templates/utilisation-reports/utilisation-report-reconciliation-for-report.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const bank = {
    id: '123',
    name: 'Test Bank',
  };
  const formattedReportPeriod = 'Nov 2023';

  const reportId = 1;

  const params = {
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
    bank,
    formattedReportPeriod,
    reportId,
    feeRecords: [],
    enablePaymentsReceivedSorting: false,
    errorSummary: undefined,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render the main heading', () => {
    wrapper.expectElement('[data-cy="utilisation-report-reconciliation-for-report-heading"]').toExist();
  });

  it('should render the report period heading', () => {
    wrapper.expectText('[data-cy="report-period-heading"]').toRead(`${formattedReportPeriod}`);
  });

  it.each`
    tabName               | dataCy                                | href
    ${'Premium payments'} | ${'bank-report-tab-premium-payments'} | ${'#premium-payments'}
    ${'Keying sheet'}     | ${'bank-report-tab-keying-sheet'}     | ${'#keying-sheet'}
    ${'Payment details'}  | ${'bank-report-tab-payment-details'}  | ${'#payment-details'}
    ${'Utilisation'}      | ${'bank-report-tab-utilisation'}      | ${'#utilisation'}
  `("should render the '$tabName' tab", ({ dataCy, tabName, href }) => {
    const tabSelector = `[data-cy="${dataCy}"]`;
    wrapper.expectElement(tabSelector).toExist();
    wrapper.expectText(tabSelector).toRead(tabName);
    wrapper.expectElement(tabSelector).toHaveAttribute('href', href);
  });

  it('should render the premium payments tab with headings, text, table and buttons', () => {
    const premiumPaymentsTabSelector = 'div#premium-payments';

    wrapper.expectElement(premiumPaymentsTabSelector).toExist();

    wrapper.expectText(`${premiumPaymentsTabSelector} h2[data-cy="premium-payments-heading"]`).toRead('Premium payments');
    wrapper
      .expectText(`${premiumPaymentsTabSelector} p`)
      .toMatch(/Enter received payments against reported fees by selecting them and then selecting the 'Add a payment' button./);
    wrapper
      .expectText(`${premiumPaymentsTabSelector} p`)
      .toMatch(
        /When payments show as matched, the adjustment data for keying into ACBS will be automatically generated when you select the 'Generate keying data' button./,
      );

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
});
