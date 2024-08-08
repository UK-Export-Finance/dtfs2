const { TEAM_IDS, UTILISATION_REPORT_RECONCILIATION_STATUS } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../componentRenderer');
const { MOCK_TFM_SESSION_USER } = require('../../../server/test-mocks/mock-tfm-session-user');

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-table-manual-reconciliation.njk';
const tableSelector = '[data-cy="utilisation-report-reconciliation-table"]';

const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = ({ userTeams } = {}) => {
    const reportPeriodSummaries = aReportPeriodSummariesViewModelWithReportsInEachStatus();
    const params = {
      user: { ...MOCK_TFM_SESSION_USER, teams: userTeams ?? [TEAM_IDS.PDC_RECONCILE] },
      summaryItems: reportPeriodSummaries[0].items,
      submissionMonth: reportPeriodSummaries[0].submissionMonth,
    };
    return render(params);
  };

  it('should render the table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(7);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Download report as CSV")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Select")`).toExist();
  });

  it('should render the table data', () => {
    const wrapper = getWrapper();
    const { summaryItems, submissionMonth } = wrapper.params;

    summaryItems.forEach((summaryItem) => {
      const rowSelector = `[data-cy="utilisation-report-reconciliation-table-row-bank-${summaryItem.bank.id}-submission-month-${submissionMonth}"]`;

      wrapper.expectElement(`${rowSelector} th`).toHaveCount(1);
      wrapper.expectElement(`${rowSelector} th:contains("${summaryItem.bank.name}")`).toExist();

      wrapper.expectText(`${rowSelector} th > p`).toRead(summaryItem.bank.name);

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(6);
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

      if (summaryItem.status !== UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
        const checkboxSelector = `${rowSelector} > td > div > div > input`;
        wrapper.expectElement(checkboxSelector).toExist();
      }
    });
  });

  it('should render the "mark report as completed" buttons for a user in "PDC_RECONCILE" team', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`[data-cy="mark-report-as-completed-button"]`).toExist();
    wrapper.expectElement(`[data-cy="mark-as-not-completed-button"]`).toExist();

    wrapper.expectElement(`div.govuk-checkboxes`).toExist();
  });

  it('should not render the "mark report as completed" buttons for a user in the "PDC_READ" team', () => {
    const userTeams = [TEAM_IDS.PDC_READ];
    const wrapper = getWrapper({ userTeams });
    wrapper.expectElement(`[data-cy="mark-report-as-completed-button"]`).notToExist();
    wrapper.expectElement(`[data-cy="mark-as-not-completed-button"]`).notToExist();

    wrapper.expectElement(`div.govuk-checkboxes`).notToExist();
  });
});

function aReportPeriodSummariesViewModelWithReportsInEachStatus() {
  return [
    {
      submissionMonth: '2023-12',
      items: [
        aReportNotReceivedReportForBank({ id: '1', name: 'Barclays' }),
        aPendingReconciliationReportForBank({ id: '2', name: 'HSBC' }),
        aReconciliationInProgressReportForBank({ id: '3', name: 'Newable' }),
        aReconciliationCompletedReportForBank({ id: '4', name: 'Natwest' }),
      ],
      reportPeriodHeading: 'This is the page heading',
      dueDateText: 'This is the due date text',
    },
  ];
}

function aReportNotReceivedReportForBank(bank) {
  return {
    frequency: 'Monthly',
    displayStatus: 'Report Not Yet Received',
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    reportId: '65784d376fe2fe26168990e8',
    bank,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  };
}

function aPendingReconciliationReportForBank(bank) {
  return {
    frequency: 'Monthly',
    displayStatus: 'Report Received but Pending Reconciliation',
    formattedDateUploaded: 'report received on this here date',
    downloadPath: 'this is the download path',
    dateUploaded: '2022-10-10T00:00:00',
    totalFacilitiesReported: 500,
    totalFeesReported: 600,
    reportedFeesLeftToReconcile: 600,
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    reportId: '65784d376fe2fe26168990e8',
    bank,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
  };
}

function aReconciliationInProgressReportForBank(bank) {
  return {
    frequency: 'Monthly',
    displayStatus: 'Report Reconciliation is in Progress',
    formattedDateUploaded: 'report received on this here date',
    downloadPath: 'this is the download path',
    dateUploaded: '2022-10-10T01:00:00',
    totalFacilitiesReported: 500,
    totalFeesReported: 600,
    reportedFeesLeftToReconcile: 500,
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    reportId: '65784d376fe2fe26168990e8',
    bank,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  };
}

function aReconciliationCompletedReportForBank(bank) {
  return {
    frequency: 'Monthly',
    displayStatus: 'Reconciled',
    formattedDateUploaded: 'report received on this here date',
    downloadPath: 'this is the download path',
    dateUploaded: '2022-10-10T02:00:00',
    totalFacilitiesReported: 500,
    totalFeesReported: 600,
    reportedFeesLeftToReconcile: 0,
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    reportId: '65784d376fe2fe26168990e8',
    bank,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  };
}
