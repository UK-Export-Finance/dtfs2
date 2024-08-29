import { addDays } from 'date-fns';
import * as ukefCommon from '@ukef/dtfs2-common';
import { IsoMonthStamp, ReportPeriod } from '@ukef/dtfs2-common';
import { getDueDateText, getReportPeriodHeading, getReportReconciliationSummariesViewModel } from './reconciliation-summary-helper';
import { MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS } from '../../../test-mocks/mock-utilisation-report-reconciliation-summary';
import { UtilisationReportReconciliationSummary } from '../../../types/utilisation-reports';
import { getUkBankHolidays } from '../../../api';
import { MOCK_BANK_HOLIDAYS } from '../../../test-mocks/mock-bank-holidays';

jest.mock('../../../api');

describe('reconciliation-summary-helper', () => {
  const isTfmPaymentReconciliationFeatureFlagEnabledSpy = jest.spyOn(ukefCommon, 'isTfmPaymentReconciliationFeatureFlagEnabled');

  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
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
    describe('when tfm payment reconciliation feature flag is enabled', () => {
      beforeEach(() => {
        isTfmPaymentReconciliationFeatureFlagEnabledSpy.mockReturnValue(true);
      });

      it("refers to 'Current reporting period end' if the submission month is this month", () => {
        // Arrange
        jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
        const submissionMonth: IsoMonthStamp = '2024-01';
        const monthlyReportPeriod: ReportPeriod = { start: { month: 12, year: 2023 }, end: { month: 12, year: 2023 } };
        const quarterlyReportPeriod: ReportPeriod = { start: { month: 10, year: 2023 }, end: { month: 12, year: 2023 } };

        // Act
        const result = getReportPeriodHeading(submissionMonth, [monthlyReportPeriod, quarterlyReportPeriod]);

        // Assert
        expect(result).toEqual('Current reporting period end: December 2023');
      });

      it("refers to 'Open reports reporting period end' if the submission month is before this month", () => {
        // Arrange
        jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
        const submissionMonth: IsoMonthStamp = '2024-02';
        const monthlyReportPeriod: ReportPeriod = { start: { month: 1, year: 2024 }, end: { month: 1, year: 2024 } };
        const quarterlyReportPeriod: ReportPeriod = { start: { month: 11, year: 2023 }, end: { month: 1, year: 2024 } };

        // Act
        const result = getReportPeriodHeading(submissionMonth, [monthlyReportPeriod, quarterlyReportPeriod]);

        // Assert
        expect(result).toEqual('Open reports reporting period end: January 2024');
      });
    });

    describe('when tfm payment reconciliation feature flag is disabled', () => {
      beforeEach(() => {
        isTfmPaymentReconciliationFeatureFlagEnabledSpy.mockReturnValue(false);
      });

      it("refers to 'Current reporting period' if the submission month is this month", () => {
        // Arrange
        jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
        const submissionMonth: IsoMonthStamp = '2024-01';
        const reportPeriod: ReportPeriod = { start: { month: 12, year: 2023 }, end: { month: 12, year: 2023 } };

        // Act
        const result = getReportPeriodHeading(submissionMonth, [reportPeriod]);

        // Assert
        expect(result).toEqual('Current reporting period: Dec 2023 (monthly)');
      });

      it('includes all report periods when submission month is this month', () => {
        // Arrange
        jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
        const submissionMonth: IsoMonthStamp = '2024-01';
        const monthlyReportPeriod: ReportPeriod = { start: { month: 12, year: 2023 }, end: { month: 12, year: 2023 } };
        const quarterlyReportPeriod: ReportPeriod = { start: { month: 10, year: 2023 }, end: { month: 12, year: 2023 } };

        // Act
        const result = getReportPeriodHeading(submissionMonth, [monthlyReportPeriod, quarterlyReportPeriod]);

        // Assert
        expect(result).toEqual('Current reporting period: Dec 2023 (monthly) and Oct to Dec 2023 (quarterly)');
      });

      it("refers to 'Open reports' if the submission month is before this month", () => {
        // Arrange
        jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
        const submissionMonth: IsoMonthStamp = '2023-12';
        const reportPeriod: ReportPeriod = { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } };

        // Act
        const result = getReportPeriodHeading(submissionMonth, [reportPeriod]);

        // Assert
        expect(result).toEqual('Open reports: Nov 2023 (monthly)');
      });

      it('includes all report periods when submission month is before this month', () => {
        // Arrange
        jest.useFakeTimers().setSystemTime(new Date('2024-01-05'));
        const submissionMonth: IsoMonthStamp = '2024-02';
        const monthlyReportPeriod: ReportPeriod = { start: { month: 1, year: 2024 }, end: { month: 1, year: 2024 } };
        const quarterlyReportPeriod: ReportPeriod = { start: { month: 11, year: 2023 }, end: { month: 1, year: 2024 } };

        // Act
        const result = getReportPeriodHeading(submissionMonth, [monthlyReportPeriod, quarterlyReportPeriod]);

        // Assert
        expect(result).toEqual('Open reports: Jan 2024 (monthly) and Nov 2023 to Jan 2024 (quarterly)');
      });
    });
  });

  describe('getReportReconciliationSummaryViewModel', () => {
    describe('when tfm payment reconciliation feature flag is enabled', () => {
      beforeEach(() => {
        isTfmPaymentReconciliationFeatureFlagEnabledSpy.mockReturnValue(true);
      });

      it('returns summary items with the additional view model properties', async () => {
        // Arrange
        const submissionMonth = '2023-12';

        const reportNotReceivedSummaryItem = {
          ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.REPORT_NOT_RECEIVED,
          reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
        };
        const pendingReconciliationSummaryItem = {
          ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
          reportPeriod: { start: { month: 9, year: 2023 }, end: { month: 11, year: 2023 } },
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
                frequency: 'Monthly',
              },
              {
                ...pendingReconciliationSummaryItem,
                frequency: 'Quarterly',
                displayStatus: 'Pending reconciliation',
                formattedDateUploaded: '3 Dec 2023',
                downloadPath: `/utilisation-reports/${pendingReconciliationSummaryItem.reportId}/download`,
              },
            ],
            submissionMonth,
            reportPeriodHeading: 'Open reports reporting period end: November 2023',
            dueDateText: 'Reports were due to be received by 14 December 2023.',
          },
        ];

        expect(result).toEqual(expectedResult);
      });
    });

    describe('when tfm payment reconciliation feature flag is not enabled', () => {
      beforeEach(() => {
        isTfmPaymentReconciliationFeatureFlagEnabledSpy.mockReturnValue(false);
      });

      it('returns summary items with the additional view model properties', async () => {
        // Arrange
        const submissionMonth = '2023-12';

        const reportNotReceivedSummaryItem = {
          ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.REPORT_NOT_RECEIVED,
          reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 11, year: 2023 } },
        };
        const pendingReconciliationSummaryItem = {
          ...MOCK_UTILISATION_REPORT_RECONCILIATION_SUMMARY_ITEMS.PENDING_RECONCILIATION,
          reportPeriod: { start: { month: 9, year: 2023 }, end: { month: 11, year: 2023 } },
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
                frequency: 'Monthly',
              },
              {
                ...pendingReconciliationSummaryItem,
                frequency: 'Quarterly',
                displayStatus: 'Pending reconciliation',
                formattedDateUploaded: '3 Dec 2023',
                downloadPath: `/utilisation-reports/${pendingReconciliationSummaryItem.reportId}/download`,
              },
            ],
            submissionMonth,
            reportPeriodHeading: 'Open reports: Nov 2023 (monthly) and Sep to Nov 2023 (quarterly)',
            dueDateText: 'Reports were due to be received by 14 December 2023.',
          },
        ];

        expect(result).toEqual(expectedResult);
      });
    });
  });
});
