const pageRenderer = require('../pageRenderer');
const { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } = require('../../server/test-mocks/mock-utilisation-report-reconciliation-summary');
const { getReportReconciliationSummaryViewModel } = require('../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper');
const { PRIMARY_NAVIGATION_ITEMS } = require('../../server/constants');

const page = '../templates/utilisation-reports/utilisation-reports.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const reportReconciliationSummary = getReportReconciliationSummaryViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);
  const reportPeriod = 'November 2023';
  const reportDueDate = '15 December 2023';

  const params = {
    activePrimaryNavigation: PRIMARY_NAVIGATION_ITEMS.UTILISATION_REPORTS,
    reportReconciliationSummary,
    reportPeriod,
    reportDueDate,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render the main heading', () => {
    wrapper.expectElement('[data-cy="utilisation-report-heading"]').toExist();
  });

  it('should render the report period heading', () => {
    wrapper.expectText('[data-cy="report-period-heading"]').toRead(`Current reporting period: ${reportPeriod} (monthly)`);
  });

  it('should render the report due date for the current period', () => {
    wrapper.expectText('[data-cy="report-due-date-text"]').toRead(`Reports due to be received by ${reportDueDate}.`);
  });

  it('should render the report reconciliation table', () => {
    wrapper.expectElement('[data-cy="utilisation-report-reconciliation-table"]').toExist();
  });
});
