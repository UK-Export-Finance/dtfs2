import { addMonths } from 'date-fns';
import {
  getCurrentReportPeriodForBankSchedule,
  getPreviousReportPeriodStart,
  getReportPeriodStartForSubmissionMonth,
  getSubmissionMonthForReportPeriodStart,
  isEqualReportPeriodStart,
} from './report-period';
import { MonthAndYear } from '../types/date';
import { ReportPeriodSchedule } from '../types/db-models/banks';

describe('report-period utils', () => {
  describe('getReportPeriodStartForSubmissionMonth', () => {
    it.each([
      { submissionMonth: '2024-02', reportPeriodStart: { month: 1, year: 2024 } },
      { submissionMonth: '2024-01', reportPeriodStart: { month: 12, year: 2023 } },
    ])('returns $reportPeriodStart when submissionMonth is $submissionMonth', ({ submissionMonth, reportPeriodStart }) => {
      expect(getReportPeriodStartForSubmissionMonth(submissionMonth)).toEqual(reportPeriodStart);
    });
  });

  describe('getSubmissionMonthForReportPeriodStart', () => {
    it.each([
      { reportPeriodStart: { month: 1, year: 2024 }, submissionMonth: '2024-02' },
      { reportPeriodStart: { month: 12, year: 2023 }, submissionMonth: '2024-01' },
    ])('returns $submissionMonth when reportPeriodStart is $reportPeriodStart', ({ reportPeriodStart, submissionMonth }) => {
      expect(getSubmissionMonthForReportPeriodStart(reportPeriodStart)).toEqual(submissionMonth);
    });
  });

  describe('getPreviousReportPeriodStart', () => {
    it.each([
      { current: { month: 2, year: 2024 }, previous: { month: 1, year: 2024 } },
      { current: { month: 1, year: 2024 }, previous: { month: 12, year: 2023 } },
    ])('returns $previous when the current ReportPeriodStart is $current', ({ current, previous }) => {
      expect(getPreviousReportPeriodStart(current)).toEqual(previous);
    });
  });

  describe('isEqualReportPeriodStart', () => {
    it.each([
      {
        testCase: 'months are the same but years are different',
        values: [
          { month: 1, year: 2023 },
          { month: 1, year: 2024 },
        ],
      },
      {
        testCase: 'years are the same but months are different',
        values: [
          { month: 1, year: 2024 },
          { month: 2, year: 2024 },
        ],
      },
    ])('returns false when $testCase', ({ values }) => {
      expect(isEqualReportPeriodStart(values[0], values[1])).toBe(false);
    });

    it('returns true when values are equal', () => {
      // Arrange
      const value1: MonthAndYear = { month: 2, year: 2024 };
      const value2: MonthAndYear = { month: 2, year: 2024 };

      // Act / Assert
      expect(isEqualReportPeriodStart(value1, value2)).toBe(true);
    });
  });

  describe('getCurrentReportPeriodForBankSchedule', () => {
    const mockYear = 2023;
    const oneIndexedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    const monthlyReportPeriodSchedule: ReportPeriodSchedule[] = oneIndexedMonths.map((month) => ({ startMonth: month, endMonth: month }));

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it.each(oneIndexedMonths)('returns the correct report period for month %s', (oneIndexedMonth) => {
      // Arrange
      const reportPeriodDate = new Date(`${mockYear}-${oneIndexedMonth}`);
      const mockCurrentDate = addMonths(reportPeriodDate, 1);
      jest.setSystemTime(mockCurrentDate);

      // Act
      const currentReportPeriod = getCurrentReportPeriodForBankSchedule(monthlyReportPeriodSchedule);

      // Assert
      expect(currentReportPeriod).toEqual({
        start: { month: oneIndexedMonth, year: mockYear },
        end: { month: oneIndexedMonth, year: mockYear },
      });
    });

    it('returns the correct report period when the report period start is in the previous year', () => {
      // Arrange
      const reportPeriodDate = new Date('2023-01');
      const mockCurrentDate = addMonths(reportPeriodDate, 1);
      jest.setSystemTime(mockCurrentDate);

      const previousYearReportSchedule: ReportPeriodSchedule = { startMonth: 11, endMonth: 1 };
      const quarterlyReportPeriodSchedule: ReportPeriodSchedule[] = [
        { startMonth: 2, endMonth: 5 },
        { startMonth: 6, endMonth: 8 },
        { startMonth: 9, endMonth: 10 },
        previousYearReportSchedule,
      ];

      // Act
      const reportPeriodStart = getCurrentReportPeriodForBankSchedule(quarterlyReportPeriodSchedule);

      // Assert
      expect(reportPeriodStart).toEqual({
        start: { month: previousYearReportSchedule.startMonth, year: mockYear - 1 },
        end: { month: previousYearReportSchedule.endMonth, year: mockYear },
      });
    });
  });
});
