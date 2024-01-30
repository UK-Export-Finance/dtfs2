import {
  getPreviousReportPeriodStart,
  getReportPeriodStartForSubmissionMonth,
  getSubmissionMonthForReportPeriodStart,
  isEqualReportPeriodStart,
} from './report-period';
import { ReportPeriodStart } from '../types/utilisation-reports';

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
      const value1: ReportPeriodStart = { month: 2, year: 2024 };
      const value2: ReportPeriodStart = { month: 2, year: 2024 };

      // Act / Assert
      expect(isEqualReportPeriodStart(value1, value2)).toBe(true);
    });
  });
});
