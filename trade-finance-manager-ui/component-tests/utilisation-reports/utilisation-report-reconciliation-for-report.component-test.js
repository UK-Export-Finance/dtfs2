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

  const params = {
    activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
    bank,
    formattedReportPeriod,
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
});
