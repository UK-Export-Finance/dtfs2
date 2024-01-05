const componentRenderer = require('../../componentRenderer');
const { getReportReconciliationSummaryViewModel } = require('../../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper');
const { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } = require('../../../server/test-mocks/mock-utilisation-report-reconciliation-summary');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-table.njk';
const tableSelector = '[data-cy="utilisation-report-reconciliation-table"]';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;

  const reportReconciliationSummary = getReportReconciliationSummaryViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY);

  const params = {
    reportReconciliationSummary,
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render the table headings', () => {
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(6);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Download report as CSV")`).toExist();
  });

  it('should render the table data', () => {
    reportReconciliationSummary.forEach((summaryItem) => {
      const rowSelector = `[data-cy="utilisation-report-reconciliation-table-row-bank-${summaryItem.bank.id}"]`;

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

  it('should render the mark report as completed and mark as not completed buttons', () => {
    wrapper.expectElement(`[data-cy="mark-report-as-completed-button"]`).toExist();
    wrapper.expectElement(`[data-cy="mark-as-not-completed-button"]`).toExist();
  });
});
