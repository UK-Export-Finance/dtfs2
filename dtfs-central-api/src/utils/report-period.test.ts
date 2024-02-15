import { addMonths } from 'date-fns';
import {
  getCurrentReportPeriodForBankSchedule,
  getPreviousReportPeriodStart,
  getReportPeriodStartForSubmissionMonth,
  getSubmissionMonthForReportPeriodStart,
  isEqualReportPeriodStart,
  parseReportPeriod,
} from './report-period';
import { MonthAndYear, OneIndexedMonth } from '../types/date';
import { BankReportPeriodSchedule } from '../types/db-models/banks';
import { ReportPeriod } from '../types/utilisation-reports';

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
    const monthlyReportPeriodSchedule: BankReportPeriodSchedule = oneIndexedMonths.map((month) => ({ startMonth: month, endMonth: month }));

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

    describe('for a non-monthly report schedule', () => {
      const nonMonthlyReportSchedule: BankReportPeriodSchedule = [
        { startMonth: 3, endMonth: 5 },
        { startMonth: 6, endMonth: 8 },
        { startMonth: 9, endMonth: 10 },
        { startMonth: 11, endMonth: 2 },
      ];

      const currentYear = 2023;
      const monthsWithExpectedReportSchedules: { month: OneIndexedMonth; expectedReportPeriod: ReportPeriod }[] = [
        { month: 1, expectedReportPeriod: { start: { month: 11, year: currentYear - 1 }, end: { month: 2, year: currentYear } } },
        { month: 2, expectedReportPeriod: { start: { month: 11, year: currentYear - 1 }, end: { month: 2, year: currentYear } } },
        { month: 3, expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } } },
        { month: 4, expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } } },
        { month: 5, expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } } },
        { month: 6, expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } } },
        { month: 7, expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } } },
        { month: 8, expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } } },
        { month: 9, expectedReportPeriod: { start: { month: 9, year: currentYear }, end: { month: 10, year: currentYear } } },
        { month: 10, expectedReportPeriod: { start: { month: 9, year: currentYear }, end: { month: 10, year: currentYear } } },
        { month: 11, expectedReportPeriod: { start: { month: 11, year: currentYear }, end: { month: 2, year: currentYear + 1 } } },
        { month: 12, expectedReportPeriod: { start: { month: 11, year: currentYear }, end: { month: 2, year: currentYear + 1 } } },
      ];

      it.each(monthsWithExpectedReportSchedules)(
        `returns the correct report period for month $month year ${currentYear}`,
        ({ month, expectedReportPeriod }) => {
          // Arrange
          const reportPeriodDate = new Date(`${currentYear}-${month}`);
          const mockCurrentDate = addMonths(reportPeriodDate, 1);
          jest.setSystemTime(mockCurrentDate);

          // Act
          const reportPeriod = getCurrentReportPeriodForBankSchedule(nonMonthlyReportSchedule);

          // Assert
          expect(reportPeriod).toEqual(expectedReportPeriod);
        },
      );
    });
  });

  describe('parseReportPeriod', () => {
    it('returns undefined if the input is undefined', () => {
      // Act
      const result = parseReportPeriod(undefined);

      // Assert
      expect(result).toBeUndefined();
    });

    const validMonthAndYearJsonObject = {
      month: '1',
      year: '2024',
    };

    it.each`
      condition                            | reportPeriodJsonObject
      ${"missing the 'start' field"}       | ${{ end: validMonthAndYearJsonObject }}
      ${"missing the 'start.month' field"} | ${{ end: validMonthAndYearJsonObject, start: { year: validMonthAndYearJsonObject.year } }}
      ${"missing the 'start.year' field"}  | ${{ end: validMonthAndYearJsonObject, start: { month: validMonthAndYearJsonObject.month } }}
      ${"missing the 'end' field"}         | ${{ start: validMonthAndYearJsonObject }}
      ${"missing the 'end.month' field"}   | ${{ start: validMonthAndYearJsonObject, end: { year: validMonthAndYearJsonObject.year } }}
      ${"missing the 'end.year' field"}    | ${{ start: validMonthAndYearJsonObject, end: { month: validMonthAndYearJsonObject.month } }}
    `('throws an error if the supplied json object is $condition', ({ reportPeriodJsonObject }: { reportPeriodJsonObject: object }) => {
      // Arrange
      const expectedError = new Error('Supplied report period json object did not match the expected format');

      // Act/Assert
      expect(() => parseReportPeriod(reportPeriodJsonObject)).toThrow(expectedError);
    });

    it.each`
      condition                                    | reportPeriodJsonObject
      ${"contains an invalid 'start.month' value"} | ${{ end: validMonthAndYearJsonObject, start: { year: validMonthAndYearJsonObject.year, month: 'January' } }}
      ${"contains an invalid 'start.year' value"}  | ${{ end: validMonthAndYearJsonObject, start: { month: validMonthAndYearJsonObject.month, year: '21st Century' } }}
      ${"contains an invalid 'end.month' value"}   | ${{ start: validMonthAndYearJsonObject, end: { year: validMonthAndYearJsonObject.year, month: 'January' } }}
      ${"contains an invalid 'end.year' value"}    | ${{ start: validMonthAndYearJsonObject, end: { month: validMonthAndYearJsonObject.month, year: '21st Century' } }}
    `('throws an error if the report period json object $condition', ({ reportPeriodJsonObject }: { reportPeriodJsonObject: object }) => {
      // Arrange
      const expectedError = new Error(`'${JSON.stringify(reportPeriodJsonObject)}' is not a valid report period`);

      // Act/Assert
      expect(() => parseReportPeriod(reportPeriodJsonObject)).toThrow(expectedError);
    });

    it('returns the parsed report period if the report period is valid', () => {
      // Arrange
      const validReportPeriod = {
        start: validMonthAndYearJsonObject,
        end: validMonthAndYearJsonObject,
      };

      // Act
      const parsedReportPeriod = parseReportPeriod(validReportPeriod);

      // Assert
      expect(parsedReportPeriod).toEqual({
        start: {
          month: Number(validReportPeriod.start.month),
          year: Number(validReportPeriod.start.year),
        },
        end: {
          month: Number(validReportPeriod.end.month),
          year: Number(validReportPeriod.end.year),
        },
      });
    });
  });
});
