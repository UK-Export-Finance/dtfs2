import { addMonths } from 'date-fns';
import {
  getCurrentReportPeriodForBankSchedule,
  getNextReportPeriodForBankSchedule,
  getFormattedReportPeriodWithLongMonth,
  getReportPeriodEndForSubmissionMonth,
  getSubmissionMonthForReportPeriod,
  getFormattedReportPeriodWithShortMonth,
  getPreviousReportPeriodForBankScheduleByMonth,
  isEqualReportPeriod,
} from './report-period';
import { OneIndexedMonth, BankReportPeriodSchedule, ReportPeriod } from '../types';

describe('report-period utils', () => {
  describe('getReportPeriodEndForSubmissionMonth', () => {
    it.each([
      { submissionMonth: '2024-02', reportPeriodEnd: { month: 1, year: 2024 } },
      { submissionMonth: '2024-01', reportPeriodEnd: { month: 12, year: 2023 } },
    ])('returns $reportPeriodStart when submissionMonth is $submissionMonth', ({ submissionMonth, reportPeriodEnd }) => {
      expect(getReportPeriodEndForSubmissionMonth(submissionMonth)).toEqual(reportPeriodEnd);
    });
  });

  describe('getSubmissionMonthForReportPeriod', () => {
    it.each([
      {
        reportPeriod: { start: { month: 11, year: 2023 }, end: { month: 1, year: 2024 } },
        submissionMonth: '2024-02',
        description: 'quarterly',
      },
      {
        reportPeriod: { start: { month: 12, year: 2023 }, end: { month: 12, year: 2023 } },
        submissionMonth: '2024-01',
        description: 'monthly',
      },
    ])('returns month after report period end when reportPeriod is a $description period', ({ reportPeriod, submissionMonth }) => {
      expect(getSubmissionMonthForReportPeriod(reportPeriod)).toEqual(submissionMonth);
    });
  });

  describe('getPreviousReportPeriodForBankScheduleByMonth', () => {
    it('gets report period for bank schedule by submission month for monthly schedule', () => {
      // Arrange
      const oneIndexedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const schedule: BankReportPeriodSchedule = oneIndexedMonths.map((month) => ({
        startMonth: month,
        endMonth: month,
      }));

      // Act
      const result = getPreviousReportPeriodForBankScheduleByMonth(schedule, '2024-04');

      // Assert
      expect(result).toEqual({ start: { month: 3, year: 2024 }, end: { month: 3, year: 2024 } });
    });

    it('gets report period for bank schedule by submission month for quarterly schedule', () => {
      // Arrange
      const schedule: BankReportPeriodSchedule = [
        { startMonth: 12, endMonth: 2 },
        { startMonth: 3, endMonth: 5 },
        { startMonth: 6, endMonth: 8 },
        { startMonth: 9, endMonth: 11 },
      ];

      // Act
      const result = getPreviousReportPeriodForBankScheduleByMonth(schedule, '2024-03');

      // Assert
      expect(result).toEqual({ start: { month: 12, year: 2023 }, end: { month: 2, year: 2024 } });
    });
  });

  describe('getNextReportPeriodForBankSchedule', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('for a monthly report schedule', () => {
      const mockYear = 2023;
      const oneIndexedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const monthlyReportPeriodSchedule: BankReportPeriodSchedule = oneIndexedMonths.map((month) => ({
        startMonth: month,
        endMonth: month,
      }));

      it.each(oneIndexedMonths)('returns the correct report period for month %s', (oneIndexedMonth) => {
        // Arrange
        const reportPeriodDate = new Date(`${mockYear}-${oneIndexedMonth}`);
        jest.setSystemTime(reportPeriodDate);

        // Act
        const nextReportPeriod = getNextReportPeriodForBankSchedule(monthlyReportPeriodSchedule);

        // Assert
        expect(nextReportPeriod).toEqual({
          start: { month: oneIndexedMonth, year: mockYear },
          end: { month: oneIndexedMonth, year: mockYear },
        });
      });
    });

    describe('for a non-monthly report schedule', () => {
      const nonMonthlyReportSchedule: BankReportPeriodSchedule = [
        { startMonth: 12, endMonth: 2 },
        { startMonth: 3, endMonth: 5 },
        { startMonth: 6, endMonth: 8 },
        { startMonth: 9, endMonth: 11 },
      ];

      const currentYear = 2023;
      const monthsWithExpectedReportSchedules: { month: OneIndexedMonth; expectedReportPeriod: ReportPeriod }[] = [
        {
          month: 1,
          expectedReportPeriod: { start: { month: 12, year: currentYear - 1 }, end: { month: 2, year: currentYear } },
        },
        {
          month: 2,
          expectedReportPeriod: { start: { month: 12, year: currentYear - 1 }, end: { month: 2, year: currentYear } },
        },
        {
          month: 3,
          expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } },
        },
        {
          month: 4,
          expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } },
        },
        {
          month: 5,
          expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } },
        },
        {
          month: 6,
          expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } },
        },
        {
          month: 7,
          expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } },
        },
        {
          month: 8,
          expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } },
        },
        {
          month: 9,
          expectedReportPeriod: { start: { month: 9, year: currentYear }, end: { month: 11, year: currentYear } },
        },
        {
          month: 10,
          expectedReportPeriod: { start: { month: 9, year: currentYear }, end: { month: 11, year: currentYear } },
        },
        {
          month: 11,
          expectedReportPeriod: { start: { month: 9, year: currentYear }, end: { month: 11, year: currentYear } },
        },
        {
          month: 12,
          expectedReportPeriod: { start: { month: 12, year: currentYear }, end: { month: 2, year: currentYear + 1 } },
        },
      ];

      it.each(monthsWithExpectedReportSchedules)(
        `returns the correct report period for month $month year ${currentYear}`,
        ({ month, expectedReportPeriod }) => {
          // Arrange
          const reportPeriodDate = new Date(`${currentYear}-${month}`);
          jest.setSystemTime(reportPeriodDate);

          // Act
          const reportPeriod = getNextReportPeriodForBankSchedule(nonMonthlyReportSchedule);

          // Assert
          expect(reportPeriod).toEqual(expectedReportPeriod);
        },
      );
    });
  });

  describe('getCurrentReportPeriodForBankSchedule', () => {
    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    describe('for a monthly report schedule', () => {
      const mockYear = 2023;
      const oneIndexedMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const monthlyReportPeriodSchedule: BankReportPeriodSchedule = oneIndexedMonths.map((month) => ({
        startMonth: month,
        endMonth: month,
      }));

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
    });

    describe('for a non-monthly report schedule', () => {
      const nonMonthlyReportSchedule: BankReportPeriodSchedule = [
        { startMonth: 12, endMonth: 2 },
        { startMonth: 3, endMonth: 5 },
        { startMonth: 6, endMonth: 8 },
        { startMonth: 9, endMonth: 11 },
      ];

      const currentYear = 2023;
      const monthsWithExpectedReportSchedules: { month: OneIndexedMonth; expectedReportPeriod: ReportPeriod }[] = [
        {
          month: 1,
          expectedReportPeriod: {
            start: { month: 9, year: currentYear - 1 },
            end: { month: 11, year: currentYear - 1 },
          },
        },
        {
          month: 2,
          expectedReportPeriod: {
            start: { month: 9, year: currentYear - 1 },
            end: { month: 11, year: currentYear - 1 },
          },
        },
        {
          month: 3,
          expectedReportPeriod: { start: { month: 12, year: currentYear - 1 }, end: { month: 2, year: currentYear } },
        },
        {
          month: 4,
          expectedReportPeriod: { start: { month: 12, year: currentYear - 1 }, end: { month: 2, year: currentYear } },
        },
        {
          month: 5,
          expectedReportPeriod: { start: { month: 12, year: currentYear - 1 }, end: { month: 2, year: currentYear } },
        },
        {
          month: 6,
          expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } },
        },
        {
          month: 7,
          expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } },
        },
        {
          month: 8,
          expectedReportPeriod: { start: { month: 3, year: currentYear }, end: { month: 5, year: currentYear } },
        },
        {
          month: 9,
          expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } },
        },
        {
          month: 10,
          expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } },
        },
        {
          month: 11,
          expectedReportPeriod: { start: { month: 6, year: currentYear }, end: { month: 8, year: currentYear } },
        },
        {
          month: 12,
          expectedReportPeriod: { start: { month: 9, year: currentYear }, end: { month: 11, year: currentYear } },
        },
      ];

      it.each(monthsWithExpectedReportSchedules)(
        `returns the correct report period for month $month year ${currentYear}`,
        ({ month, expectedReportPeriod }) => {
          // Arrange
          const reportPeriodDate = new Date(`${currentYear}-${month}`);
          jest.setSystemTime(reportPeriodDate);

          // Act
          const reportPeriod = getCurrentReportPeriodForBankSchedule(nonMonthlyReportSchedule);

          // Assert
          expect(reportPeriod).toEqual(expectedReportPeriod);
        },
      );
    });
  });

  describe('getFormattedReportPeriodWithLongMonth', () => {
    const testData: { description: string; reportPeriod: ReportPeriod; expectedResponse: string }[] = [
      {
        description: 'report period spans 1 month',
        reportPeriod: {
          start: {
            month: 1,
            year: 2023,
          },
          end: {
            month: 1,
            year: 2023,
          },
        },
        expectedResponse: 'January 2023',
      },
      {
        description: 'report period spans multiple months in the same year',
        reportPeriod: {
          start: {
            month: 3,
            year: 2023,
          },
          end: {
            month: 5,
            year: 2023,
          },
        },
        expectedResponse: 'March to May 2023',
      },
      {
        description: 'report period spans multiple months over 2 years',
        reportPeriod: {
          start: {
            month: 12,
            year: 2022,
          },
          end: {
            month: 2,
            year: 2023,
          },
        },
        expectedResponse: 'December 2022 to February 2023',
      },
    ];
    it.each(testData)('returns $expectedResponse when $description', ({ reportPeriod, expectedResponse }) => {
      const response = getFormattedReportPeriodWithLongMonth(reportPeriod);

      expect(response).toEqual(expectedResponse);
    });
  });

  describe('getFormattedReportPeriodWithShortMonth', () => {
    it.each`
      description                                                                                   | reportPeriod                                                           | includePeriodicity | expectedResponse
      ${'"MMM YYYY" when report period spans 1 month'}                                              | ${{ start: { month: 4, year: 2030 }, end: { month: 4, year: 2030 } }}  | ${false}           | ${'Apr 2030'}
      ${'"MMM YYYY (monthly)" report period spans 1 month'}                                         | ${{ start: { month: 4, year: 2030 }, end: { month: 4, year: 2030 } }}  | ${true}            | ${'Apr 2030 (monthly)'}
      ${'"MMM to MMM YYYY" when report period spans multiple months over 1 year'}                   | ${{ start: { month: 3, year: 2023 }, end: { month: 5, year: 2023 } }}  | ${false}           | ${'Mar to May 2023'}
      ${'"MMM to MMM YYYY (quarterly)" when report period spans multiple months over 1 year'}       | ${{ start: { month: 3, year: 2023 }, end: { month: 5, year: 2023 } }}  | ${true}            | ${'Mar to May 2023 (quarterly)'}
      ${'"MMM YYYY to MMM YYYY" when report period spans multiple months over 2 years'}             | ${{ start: { month: 12, year: 2022 }, end: { month: 2, year: 2023 } }} | ${false}           | ${'Dec 2022 to Feb 2023'}
      ${'"MMM YYYY to MMM YYYY (quarterly)" when report period spans multiple months over 2 years'} | ${{ start: { month: 12, year: 2022 }, end: { month: 2, year: 2023 } }} | ${true}            | ${'Dec 2022 to Feb 2023 (quarterly)'}
    `(
      'returns period formatted $description and includePeriodicity is $includePeriodicity',
      ({ reportPeriod, includePeriodicity, expectedResponse }: { reportPeriod: ReportPeriod; includePeriodicity: boolean; expectedResponse: string }) => {
        // Act
        const response = getFormattedReportPeriodWithShortMonth(reportPeriod, includePeriodicity);

        // Assert
        expect(response).toEqual(expectedResponse);
      },
    );

    it('should include year for start of report period contained in a single year when "alwaysStateYear" is true', () => {
      // Arrange
      const reportPeriod = { start: { month: 3, year: 2023 }, end: { month: 5, year: 2023 } };

      // Act
      const response = getFormattedReportPeriodWithShortMonth(reportPeriod, false, true);

      // Assert
      expect(response).toEqual('Mar 2023 to May 2023');
    });
  });

  describe('isEqualReportPeriod', () => {
    it('returns true when the two supplied report periods are equal', () => {
      // Arrange
      const reportPeriod1: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const reportPeriod2: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };

      // Act
      const result = isEqualReportPeriod(reportPeriod1, reportPeriod2);

      // Assert
      expect(result).toEqual(true);
    });

    it('returns false when the two supplied report periods are not equal', () => {
      // Arrange
      const reportPeriod1: ReportPeriod = {
        start: { month: 1, year: 2024 },
        end: { month: 1, year: 2024 },
      };
      const reportPeriod2: ReportPeriod = {
        start: { month: 2, year: 2025 },
        end: { month: 2, year: 2025 },
      };

      // Act
      const result = isEqualReportPeriod(reportPeriod1, reportPeriod2);

      // Assert
      expect(result).toEqual(false);
    });
  });
});
