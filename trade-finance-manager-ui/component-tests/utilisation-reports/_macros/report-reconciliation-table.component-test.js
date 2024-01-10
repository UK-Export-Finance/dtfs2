const componentRenderer = require('../../componentRenderer');
const { getUkBankHolidays } = require('../../../server/api');
const { getReportReconciliationSummariesViewModel } = require('../../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper');
const { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } = require('../../../server/test-mocks/mock-utilisation-report-reconciliation-summary');
const { MOCK_BANK_HOLIDAYS } = require('../../../server/test-mocks/mock-bank-holidays');

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-table.njk';
const tableSelector = '[data-cy="utilisation-report-reconciliation-table"]';

const render = componentRenderer(component);

describe(component, () => {
  beforeAll(() => {
    jest.mocked(getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
  });

  const getWrapper = async () => {
    const reportPeriodSummaries = await getReportReconciliationSummariesViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY, 'user-token');
    const params = {
      summaryItems: reportPeriodSummaries[0].items,
      submissionMonth: reportPeriodSummaries[0].submissionMonth,
    };
    return render(params);
  };

  it('should render the table headings', async () => {
    const wrapper = await getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(6);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Download report as CSV")`).toExist();
  });

  it('should render the table data', async () => {
    const wrapper = await getWrapper();
    const { summaryItems, submissionMonth } = wrapper.params;

    summaryItems.forEach((summaryItem) => {
      const rowSelector = `[data-cy="utilisation-report-reconciliation-table-row-bank-${summaryItem.bank.id}-submission-month-${submissionMonth}"]`;

      wrapper.expectElement(`${rowSelector} th`).toHaveCount(1);
      wrapper.expectElement(`${rowSelector} th:contains("${summaryItem.bank.name}")`).toExist();

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(5);
      wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.displayStatus}")`).toExist();
      if (summaryItem.formattedDateUploaded) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.formattedDateUploaded}")`).toExist();
      }
      if (summaryItem.totalFeesReported) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.totalFeesReported}")`).toExist();
      }
      if (summaryItem.reportedFeesLeftToReconcile) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.reportedFeesLeftToReconcile}")`).toExist();
      }
      if (summaryItem.downloadPath) {
        wrapper.expectLink(`${rowSelector} a:contains("Download")`).toLinkTo(summaryItem.downloadPath, 'Download');
      }
    });
  });

  it('should render the mark report as completed and mark as not completed buttons', async () => {
    const wrapper = await getWrapper();
    wrapper.expectElement(`[data-cy="mark-report-as-completed-button"]`).toExist();
    wrapper.expectElement(`[data-cy="mark-as-not-completed-button"]`).toExist();
  });
});
