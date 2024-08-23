import { IsoMonthStamp, UTILISATION_REPORT_RECONCILIATION_STATUS } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../componentRenderer';
import { getUkBankHolidays } from '../../../server/api';
import { getReportReconciliationSummariesViewModel } from '../../../server/controllers/utilisation-reports/helpers/reconciliation-summary-helper';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY } from '../../../server/test-mocks/mock-utilisation-report-reconciliation-summary';
import { MOCK_TFM_SESSION_USER } from '../../../server/test-mocks/mock-tfm-session-user';
import { MOCK_BANK_HOLIDAYS } from '../../../server/test-mocks/mock-bank-holidays';
import { UtilisationReportSummaryViewModel } from '../../../server/types/view-models';

jest.mock('../../../server/api');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-table.njk';
const tableSelector = '[data-cy="utilisation-report-reconciliation-table"]';

const render = componentRenderer(component);

const originalProcessEnv = process.env;

type ReportReconciliationTableParams = {
  summaryItems: UtilisationReportSummaryViewModel[];
  submissionMonth: IsoMonthStamp;
};

describe(component, () => {
  beforeAll(() => {
    jest.mocked(getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);
    process.env.UTILISATION_REPORT_DUE_DATE_BUSINESS_DAYS_FROM_START_OF_MONTH = '10';
  });

  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  const getWrapper = async () => {
    const reportSummaries = await getReportReconciliationSummariesViewModel(MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY, 'user-token');
    const params = {
      user: MOCK_TFM_SESSION_USER,
      summaryItems: reportSummaries[0].items,
      submissionMonth: reportSummaries[0].submissionMonth,
    };
    return render(params);
  };

  it('should render the table headings', async () => {
    const wrapper = await getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(6);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total facilities reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toExist();
    wrapper.expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`).toExist();
  });

  it('should render the table headings with fixed widths', async () => {
    const wrapper = await getWrapper();
    wrapper.expectElement(`${tableSelector} thead th`).toHaveCount(6);
    wrapper.expectElement(`${tableSelector} thead th:contains("Bank")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-sixth');
    wrapper.expectElement(`${tableSelector} thead th:contains("Status")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-sixth');
    wrapper.expectElement(`${tableSelector} thead th:contains("Date report received")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-sixth');
    wrapper
      .expectElement(`${tableSelector} thead th:contains("Total facilities reported")`)
      .toHaveAttribute('class', 'govuk-table__header ukef-width-one-sixth');
    wrapper.expectElement(`${tableSelector} thead th:contains("Total fees reported")`).toHaveAttribute('class', 'govuk-table__header ukef-width-one-sixth');
    wrapper
      .expectElement(`${tableSelector} thead th:contains("Reported fees left to reconcile")`)
      .toHaveAttribute('class', 'govuk-table__header ukef-width-one-sixth');
  });

  it('should render the table data', async () => {
    const wrapper = await getWrapper();
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

      wrapper.expectElement(`${rowSelector} td`).toHaveCount(5);
      wrapper.expectElement(`${rowSelector} td:contains("${summaryItem.displayStatus}")`).toExist();
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
