const { TEAM_IDS } = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');
const { getUkBankHolidays } = require('../../../server/api');
const { getReportReconciliationSummariesViewModel } = require('../../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper');
const { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } = require('../../../server/test-mocks/mock-utilisation-report-reconciliation-summary');
const { MOCK_TFM_SESSION_USER } = require('../../../server/test-mocks/mock-tfm-session-user');
const { MOCK_BANK_HOLIDAYS } = require('../../../server/test-mocks/mock-bank-holidays');

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-table.njk';
const tableSelector = '[data-cy="utilisation-report-reconciliation-table"]';

const render = componentRenderer(component);

const originalProcessEnv = process.env;

describe(component, () => {
  beforeAll(() => {
    jest.mocked(getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = 10;
  });

  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  const getWrapper = async (userTeams) => {
    const reportPeriodSummaries = await getReportReconciliationSummariesViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY, 'user-token');
    const params = {
      user: { ...MOCK_TFM_SESSION_USER, teams: userTeams || [TEAM_IDS.PDC_RECONCILE] },
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

  it('should render the "mark report as completed" buttons for a user in "PDC_RECONCILE" team', async () => {
    const wrapper = await getWrapper();
    wrapper.expectElement(`[data-cy="mark-report-as-completed-button"]`).toExist();
    wrapper.expectElement(`[data-cy="mark-as-not-completed-button"]`).toExist();

    wrapper.expectElement(`div.govuk-checkboxes`).toExist();
  });

  it('should not render the "mark report as completed" buttons for a user in the "PDC_READ" team', async () => {
    const userTeams = [TEAM_IDS.PDC_READ];
    const wrapper = await getWrapper(userTeams);
    wrapper.expectElement(`[data-cy="mark-report-as-completed-button"]`).notToExist();
    wrapper.expectElement(`[data-cy="mark-as-not-completed-button"]`).notToExist();

    wrapper.expectElement(`div.govuk-checkboxes`).notToExist();
  });
});
