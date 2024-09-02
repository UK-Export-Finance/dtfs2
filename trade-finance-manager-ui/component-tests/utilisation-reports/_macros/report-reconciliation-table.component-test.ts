import { IsoMonthStamp, UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../componentRenderer';
import { MOCK_TFM_SESSION_USER } from '../../../server/test-mocks/mock-tfm-session-user';
import { UtilisationReportSummaryViewModel } from '../../../server/types/view-models';

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-table.njk';
const tableSelector = '[data-cy="utilisation-report-reconciliation-table"]';

const render = componentRenderer(component);

type ReportReconciliationTableParams = {
  summaryItems: UtilisationReportSummaryViewModel[];
  submissionMonth: IsoMonthStamp;
};

describe(component, () => {
  const getWrapper = () => {
    const reportSummaries = aListOfUtilisationReportSummaryViewModelsWithReportsInEachStatus();
    const params = {
      user: MOCK_TFM_SESSION_USER,
      summaryItems: reportSummaries,
      submissionMonth: '2023-12',
    };
    return render(params);
  };

  it('should render the table headings', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(7);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Frequency")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total facilities reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`).toExist();
  });

  it('should render the table headings with fixed widths', () => {
    const wrapper = getWrapper();
    wrapper.expectElement(tableSelector).toHaveAttribute('class', 'govuk-table utilisation-report-reconciliation-table');
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(7);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toHaveAttribute('class', 'govuk-table__header ukef-width-two-ninths');
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toHaveAttribute('class', 'govuk-table__header ukef-width-two-ninths');
    wrapper.expectElement(`${tableSelector} thead th:contains("Frequency")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-ninth');
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-ninth');
    wrapper
      .expectElement(`${tableSelector} thead th:contains("Total facilities reported")`)
      .toHaveAttribute('class', 'govuk-table__header ukef-width-one-ninth');
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-ninth');
    wrapper
      .expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`)
      .toHaveAttribute('class', 'govuk-table__header ukef-width-one-ninth');
  });

  it('should render the table data', () => {
    const wrapper = getWrapper();
    const { summaryItems, submissionMonth } = wrapper.params as ReportReconciliationTableParams;

    summaryItems.forEach((summaryItem) => {
      const rowSelector = `[data-cy="utilisation-report-reconciliation-table-row-bank-${summaryItem.bank.id}-submission-month-${submissionMonth}"]`;

      wrapper.expectElement(`${rowSelector} th`).toHaveCount(1);
      wrapper.expectElement(`${rowSelector} th:contains("${summaryItem.bank.name}")`).toExist();

      if (summaryItem.status === UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED) {
        wrapper.expectText(`${rowSelector} th > p`).toRead(summaryItem.bank.name);
      } else {
        wrapper.expectLink(`${rowSelector} th > p > a`).toLinkTo(`/utilisation-reports/${summaryItem.reportId}`, summaryItem.bank.name);
      }

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(6);
      wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.displayStatus}")`).toExist();
      wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.frequency}")`).toExist();
      if (summaryItem.formattedDateUploaded) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.formattedDateUploaded}")`).toExist();
      }
      if (summaryItem.totalFacilitiesReported) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.totalFacilitiesReported}")`).toExist();
      }
      if (summaryItem.totalFeesReported) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.totalFeesReported}")`).toExist();
      }
      if (summaryItem.reportedFeesLeftToReconcile) {
        wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.reportedFeesLeftToReconcile}")`).toExist();
      }
    });
  });
});

function aListOfUtilisationReportSummaryViewModelsWithReportsInEachStatus(): UtilisationReportSummaryViewModel[] {
  return [
    aReportNotReceivedReportForBank({ id: '1', name: 'Barclays' }),
    aPendingReconciliationReportForBank({ id: '2', name: 'HSBC' }),
    aReconciliationInProgressReportForBank({ id: '3', name: 'Newable' }),
    aReconciliationCompletedReportForBank({ id: '4', name: 'Natwest' }),
  ];
}

function aReportNotReceivedReportForBank(bank: { id: string; name: string }): UtilisationReportSummaryViewModel {
  return {
    frequency: 'Monthly',
    displayStatus: 'Report Not Yet Received',
    reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
    reportId: '65784d376fe2fe26168990e8',
    bank,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
  };
}

function aPendingReconciliationReportForBank(bank: { id: string; name: string }): UtilisationReportSummaryViewModel {
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

function aReconciliationInProgressReportForBank(bank: { id: string; name: string }): UtilisationReportSummaryViewModel {
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

function aReconciliationCompletedReportForBank(bank: { id: string; name: string }): UtilisationReportSummaryViewModel {
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
