const pageRenderer = require('../pageRenderer');

const page = '../templates/utilisation-reports/utilisation-report-for-bank.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const bank = {
    id: '123',
    name: 'Test Bank',
  };
  const reportPeriod = 'November 2023';

  const params = {
    activePrimaryNavigation: 'utilisation reports',
    bank,
    reportPeriod,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render the main heading', () => {
    wrapper.expectElement('[data-cy="utilisation-report-for-bank-heading"]').toExist();
  });

  it('should render the report period heading', () => {
    wrapper.expectText('[data-cy="report-period-heading"]').toRead(`${reportPeriod}`);
  });

  it.each`
    tabName               | dataCy
    ${'Premium payments'} | ${'bank-report-tab-premium-payments'}
    ${'Keying sheet'}     | ${'bank-report-tab-keying-sheet'}
    ${'Payment details'}  | ${'bank-report-tab-payment-details'}
    ${'Utilisation'}      | ${'bank-report-tab-utilisation'}
  `("should render the '$tabName' tab", ({ dataCy }) => {
    wrapper.expectElement(`[data-cy="${dataCy}"]`).toExist();
  });
});
