const { UtilisationReportEntityMockBuilder, FeeRecordEntityMockBuilder, PENDING_RECONCILIATION, RECONCILIATION_IN_PROGRESS } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../componentRenderer');
const { getFindReportSummaryItemViewModel } = require('../../../server/controllers/utilisation-reports/helpers/find-reports-by-year-helper');
const { MOCK_TFM_SESSION_USER } = require('../../../server/test-mocks/mock-tfm-session-user');

const component = '../templates/utilisation-reports/_macros/search-reports-table.njk';
const tableSelector = '[data-cy="utilisation-reports-by-bank-and-year-table"]';

const render = componentRenderer(component);

const originalProcessEnv = { ...process.env };

const mapReportToSummaryItem = (bank, report) => {
  const totalFeesReported = report.feeRecords.length;

  // TODO FN-1398 - status to be added to report fee records to allow us to calculate how
  //  many facilities are left to reconcile
  const reportedFeesLeftToReconcile = totalFeesReported;

  return {
    reportId: report.id,
    reportPeriod: report.reportPeriod,
    bank: {
      id: bank.id,
      name: bank.name,
    },
    status: report.status,
    dateUploaded: report.dateUploaded ?? undefined,
    totalFeesReported,
    reportedFeesLeftToReconcile,
  };
};

const BANK = {
  id: '1',
  name: 'Test Bank 1',
};

describe(component, () => {
  afterAll(() => {
    process.env = originalProcessEnv;
  });

  const getWrapper = ({ isTfmPaymentReconciliationFeatureFlagEnabled } = {}) => {
    const getReportPeriod = (month) => {
      return {
        start: {
          month,
          year: 2024,
        },
        end: {
          month,
          year: 2024,
        },
      };
    };

    const pendingMockReport = UtilisationReportEntityMockBuilder.forStatus(PENDING_RECONCILIATION)
      .withDateUploaded('2023-12-01T15:04:53Z')
      .withReportPeriod(getReportPeriod(10))
      .build();
    const pendingFeeRecord = FeeRecordEntityMockBuilder.forReport(pendingMockReport).build();
    pendingMockReport.feeRecords = [pendingFeeRecord];
    const reconciliationInProgressMockReport = UtilisationReportEntityMockBuilder.forStatus(RECONCILIATION_IN_PROGRESS)
      .withDateUploaded('2023-12-01T15:04:53Z')
      .withReportPeriod(getReportPeriod(11))
      .build();
    const reconciliationInProgressFeeRecord = FeeRecordEntityMockBuilder.forReport(reconciliationInProgressMockReport).build();
    reconciliationInProgressMockReport.feeRecords = [reconciliationInProgressFeeRecord];

    const mockReports = [
      getFindReportSummaryItemViewModel(mapReportToSummaryItem(BANK, pendingMockReport)),
      getFindReportSummaryItemViewModel(mapReportToSummaryItem(BANK, reconciliationInProgressMockReport)),
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

      wrapper
        .expectLink(`td > a:contains("${report.formattedReportPeriod}")`)
        .toLinkTo(`/utilisation-reports/${report.reportId}`, report.formattedReportPeriod);

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
