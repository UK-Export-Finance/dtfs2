const componentRenderer = require('../../componentRenderer');
const { getReportViewModel } = require('../../../server/controllers/utilisation-reports/helpers/find-reports-by-year-helper');
const { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS } = require('../../../server/test-mocks/mock-utilisation-report-reconciliation-summary');
const { MOCK_TFM_SESSION_USER } = require('../../../server/test-mocks/mock-tfm-session-user');

const component = '../templates/utilisation-reports/_macros/search-reports-table.njk';
const tableSelector = '[data-cy="utilisation-reports-by-bank-and-year-table"]';

const render = componentRenderer(component);

const originalProcessEnv = process.env;

describe(component, () => {
  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  const getWrapper = ({ isTfmPaymentReconciliationFeatureFlagEnabled } = {}) => {
    const mockReports = [
      getReportViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION),
      getReportViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.RECONCILIATION_IN_PROGRESS),
    ];
    const params = {
      user: MOCK_TFM_SESSION_USER,
      reports: mockReports,
      isTfmPaymentReconciliationFeatureFlagEnabled: isTfmPaymentReconciliationFeatureFlagEnabled ?? false,
    };
    return render(params);
  };

  it('should render the table headings', async () => {
    const wrapper = await getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(5);
    wrapper.expectElement(`${tableSelector} thead th:contains("Reporting Period")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`).toExist();
  });

  it('should render the table data with no links to the utilisation report reconciliation for bank page when the feature is disabled', async () => {
    const wrapper = await getWrapper({ isTfmPaymentReconciliationFeatureFlagEnabled: false });
    const { reports } = wrapper.params;

    reports.forEach((report) => {
      wrapper.expectElement(`td:contains("${report.formattedReportPeriod}")`).toExist();
      wrapper.expectElement(`td > a`).notToExist();

      wrapper.expectElement(`td:contains("${report.displayStatus}")`).toExist();
      if (report.formattedDateUploaded) {
        wrapper.expectElement(`td:contains("${report.formattedDateUploaded}")`).toExist();
      }
      if (report.totalFeesReported) {
        wrapper.expectElement(`td:contains("${report.totalFeesReported}")`).toExist();
      }
      if (report.reportedFeesLeftToReconcile) {
        wrapper.expectElement(`td:contains("${report.reportedFeesLeftToReconcile}")`).toExist();
      }
    });
  });

  it('should render the table data with links to the utilisation report reconciliation for bank page when the feature is enabled', async () => {
    const wrapper = await getWrapper({ isTfmPaymentReconciliationFeatureFlagEnabled: true });
    const { reports } = wrapper.params;

    reports.forEach((report) => {
      wrapper.expectElement(`td:contains("${report.formattedReportPeriod}")`).toExist();

      wrapper.expectLink('td > a').toLinkTo(`/utilisation-reports/${report.reportId}`, report.formattedReportPeriod);

      wrapper.expectElement(`td:contains("${report.displayStatus}")`).toExist();
      if (report.formattedDateUploaded) {
        wrapper.expectElement(`td:contains("${report.formattedDateUploaded}")`).toExist();
      }
      if (report.totalFeesReported) {
        wrapper.expectElement(`td:contains("${report.totalFeesReported}")`).toExist();
      }
      if (report.reportedFeesLeftToReconcile) {
        wrapper.expectElement(`td:contains("${report.reportedFeesLeftToReconcile}")`).toExist();
      }
    });
  });
});
