import { pageRenderer } from '../pageRenderer';
import { getUkBankHolidays } from '../../server/api';
import { MOCK_BANK_HOLIDAYS } from '../../server/test-mocks/mock-bank-holidays';
import { MOCK_TFM_SESSION_USER } from '../../server/test-mocks/mock-tfm-session-user';
import { PRIMARY_NAVIGATION_KEYS } from '../../server/constants';

jest.mock('../../server/api');

const page = '../templates/utilisation-reports/utilisation-reports.njk';
const render = pageRenderer(page);

const originalProcessEnv = { ...process.env };

describe(page, () => {
  beforeAll(() => {
    jest.mocked(getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';
  });

  afterAll(() => {
    process.env = originalProcessEnv;
  });

  const getWrapper = (isPDCReadUser = false) => {
    const reportPeriodSummaries = [
      {
        items: [],
        submissionMonth: '2023-12',
        reportPeriodHeading: 'A heading to display for the report period',
        dueDateText: 'Some text to display explaining the due date',
      },
    ];
    const params = {
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      reportPeriodSummaries,
      user: MOCK_TFM_SESSION_USER,
      isTfmPaymentReconciliationFeatureFlagEnabled: false,
      isPDCReadUser,
    };
    return render(params);
  };

  it('should NOT render the read only banner', () => {
    getWrapper().expectElement('[data-cy="read-only-banner"]').notToExist();
  });

  it('should render the main heading', () => {
    getWrapper().expectElement('[data-cy="utilisation-report-heading"]').toExist();
  });

  it('should render the search link', () => {
    getWrapper().expectLink('a[data-cy="find-reports-by-year-link"]').toLinkTo('/utilisation-reports/find-reports-by-year', 'Find reports by year');
  });

  it('should render the report period heading', () => {
    getWrapper().expectText('[data-cy="2023-12-submission-month-report-period-heading"]').toRead('A heading to display for the report period');
  });

  it('should render the report due date for the current period', () => {
    getWrapper().expectText(`[data-cy="2023-12-submission-month-report-due-date-text"]`).toRead('Some text to display explaining the due date');
  });

  it('should render the report reconciliation table', () => {
    getWrapper().expectElement('[data-cy="utilisation-report-reconciliation-table"]').toExist();
  });

  it('should render the read only banner for PDC_READ users', () => {
    getWrapper(true).expectElement('[data-cy="read-only-banner"]').toExist();
    getWrapper(true)
      .expectText(`[data-cy="read-only-banner"]`)
      .toContain(
        'You are viewing the trade finance manager in read-only view. You will not be able to perform any actions to the reported fees on the system.',
      );
  });
});
