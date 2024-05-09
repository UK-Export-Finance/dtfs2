const pageRenderer = require('../pageRenderer');
const { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } = require('../../server/test-mocks/mock-utilisation-report-reconciliation-summary');
const { getReportReconciliationSummariesViewModel } = require('../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper');
const { getUkBankHolidays } = require('../../server/api');
const { MOCK_BANK_HOLIDAYS } = require('../../server/test-mocks/mock-bank-holidays');
const { MOCK_TFM_SESSION_USER } = require('../../server/test-mocks/mock-tfm-session-user');
const { PRIMARY_NAVIGATION_KEYS } = require('../../server/constants');

jest.mock('../../server/api');

const page = '../templates/utilisation-reports/utilisation-reports.njk';
const render = pageRenderer(page);

const originalProcessEnv = process.env;

describe(page, () => {
  beforeAll(() => {
    jest.mocked(getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;
  });

  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  const getWrapper = async () => {
    const reportPeriodSummaries = await getReportReconciliationSummariesViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY, 'user-token');
    const params = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportPeriodSummaries,
      user: MOCK_TFM_SESSION_USER,
      isTfmPaymentReconciliationFeatureFlagEnabled: false,
    };
    return render(params);
  };

  it('should render the main heading', async () => {
    (await getWrapper()).expectElement('[data-cy="utilisation-report-heading"]').toExist();
  });

  it('should render the report period heading', async () => {
    (await getWrapper()).expectText('[data-cy="2023-12-submission-month-report-period-heading"]').toRead(`Open reports: Nov 2023 (monthly)`);
  });

  it('should render the report due date for the current period', async () => {
    (await getWrapper()).expectText(`[data-cy="2023-12-submission-month-report-due-date-text"]`).toRead(`Reports were due to be received by 14 December 2023.`);
  });

  it('should render the report reconciliation table', async () => {
    (await getWrapper()).expectElement('[data-cy="utilisation-report-reconciliation-table"]').toExist();
  });
});
