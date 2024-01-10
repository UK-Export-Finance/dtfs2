import { addDays } from 'date-fns';
import { getDueDateText, getReportPeriodHeading, getReportReconciliationSummariesViewModel } from './reconciliation-summary-helper';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS } from '../../../test-mocks/mock-utilisation-report-reconciliation-summary';
import { ReportPeriodStart, UtilisationReportReconciliationSummary } from '../../../types/utilisation-reports';
import { getUkBankHolidays } from '../../../api';
import { MOCK_BANK_HOLIDAYS } from '../../../test-mocks/mock-bank-holidays';
import { IsoMonthStamp } from '../../../types/date';

jest.mock('../../../api');

describe('reconciliation-summary-helper', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getDueDateText', () => {
    const reportDueDate = new Date('2024-01-15T12:00:00');

    it.each([
      { now: new Date('2023-12-15') },
      { now: new Date('2024-01-14') },
      { now: new Date('2024-01-15T00:00:00') },
      { now: new Date('2024-01-15T12:00:00') },
      { now: new Date('2024-01-15T23:59:59') },
    ])(`refers to 'Reports due' if the reportDueDate is today or in the future (now: $now, reportDueDate: ${reportDueDate.toISOString()})}`, ({ now }) => {
      // Arrange
      jest.useFakeTimers().setSystemTime(now);

      // Act
      const result = getDueDateText(reportDueDate);

      // Assert
      expect(result).toEqual('Reports due to be received by 15 January 2024.');
    });

    it(`refers to 'Reports were due' if the reportDueDate day is in the past`, () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(addDays(reportDueDate, 1));

      // Act
      const result = getDueDateText(reportDueDate);

      // Assert
      expect(result).toEqual('Reports were due to be received by 15 January 2024.');
    });
  });

  describe('getReportPeriodHeading', () => {
    it("refers to 'Current reporting period' if the submission month is this month", () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
      const submissionMonth: IsoMonthStamp = '2024-01';
      const reportPeriodStart: ReportPeriodStart = { month: 12, year: 2023 };

      // Act
      const result = getReportPeriodHeading(submissionMonth, reportPeriodStart);

      // Assert
      expect(result).toEqual('Current reporting period: Dec 2023');
    });

    it("refers to 'Open reports' if the submission month is before this month", () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
      const submissionMonth: IsoMonthStamp = '2023-12';
      const reportPeriodStart: ReportPeriodStart = { month: 11, year: 2023 };

      // Act
      const result = getReportPeriodHeading(submissionMonth, reportPeriodStart);

      // Assert
      expect(result).toEqual('Open reports: Nov 2023');
    });
  });

  describe('getReportReconciliationSummaryViewModel', () => {
    it('returns summary items with the additional view model properties', async () => {
      // Arrange
      const submissionMonth = '2023-12';

      const reportNotReceivedSummaryItem = MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.REPORT_NOT_RECEIVED;
      const pendingReconciliationSummaryItem = {
        ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
        dateUploaded: '2023-12-03T15:45:00Z',
      };
      const summariesApiResponse: UtilisationReportReconciliationSummary[] = [
        {
          submissionMonth,
          items: [reportNotReceivedSummaryItem, pendingReconciliationSummaryItem],
        },
      ];

      jest.mocked(getUkBankHolidays).mockResolvedValue(MOCK_BANK_HOLIDAYS);

      // Act
      const result = await getReportReconciliationSummariesViewModel(summariesApiResponse, 'user-token');

      // Assert
      const expectedResult: Awaited<ReturnType<typeof getReportReconciliationSummariesViewModel>> = [
        {
          items: [
            {
              ...reportNotReceivedSummaryItem,
              displayStatus: 'Not received',
            },
            {
              ...pendingReconciliationSummaryItem,
              displayStatus: 'Pending reconciliation',
              formattedDateUploaded: '3 Dec 2023',
              downloadPath: `/utilisation-reports/${pendingReconciliationSummaryItem.reportId}/download`,
            },
          ],
          submissionMonth,
          reportPeriodStart: { month: 11, year: 2023 },
          reportPeriodHeading: 'Open reports: Nov 2023',
          dueDateText: 'Reports were due to be received by 14 December 2023.',
        },
      ];

      expect(result).toEqual(expectedResult);
    });
  });
});
