import { addMonths } from 'date-fns';
import { getCurrentReportPeriodForBankSchedule } from './utilisation-reports';
import { BankReportPeriodSchedule, OneIndexedMonth } from '../types';
import { ReportPeriodPartialEntity } from '../sql-db-entities/partial-entities';

describe('utilisation-reports helpers', () => {
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
      const monthsWithExpectedReportSchedules: { month: OneIndexedMonth; expectedReportPeriod: ReportPeriodPartialEntity }[] = [
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
});
