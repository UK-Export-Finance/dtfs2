const componentRenderer = require('../../componentRenderer');
const { getReportReconciliationSummaryViewModel } = require('../../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper');
const MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY = require('../../../server/test-mocks/mock-utilisation-report-reconciliation-summary');

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
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(5);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total facilities reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Facilities left to reconcile")`).toExist();
  });

  it('should render the table data', () => {
    reportReconciliationSummary.forEach((summaryItem) => {
      const rowSelector = `[data-cy="utilisation-report-reconciliation-table-row-bank-${summaryItem.bank.id}"]`;

      wrapper.expectElement(`${rowSelector} th`).toHaveCount(1);
      wrapper.expectElement(`${rowSelector} th:contains("${summaryItem.bank.name}")`).toExist();

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(4);
      wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.displayStatus}")`).toExist();
      if (summaryItem.formattedDateUploaded) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.formattedDateUploaded}")`).toExist();
      }
      if (summaryItem.totalFacilitiesReported) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.totalFacilitiesReported}")`).toExist();
      }
      if (summaryItem.facilitiesLeftToReconcile) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.totalFacilitiesReported}")`).toExist();
      }
    });
  });
});
