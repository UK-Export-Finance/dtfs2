import { addDays, addMonths, startOfMonth, subMonths } from 'date-fns';
import { ReportPeriod } from '@ukef/dtfs2-common';
import { calculateFixedFee } from './calculate-fixed-fee';

console.error = jest.fn();

describe('calculateFixedFeeAdjustment', () => {
  const TODAY = new Date();

  const getReportPeriodForDate = (date: Date): ReportPeriod => ({
    start: { month: date.getMonth() + 1, year: date.getFullYear() },
    end: { month: date.getMonth() + 1, year: date.getFullYear() },
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when the report period starts before the cover start date', () => {
    it('returns the product of the utilisation, interest percentage (divided by 100), bank admin fee percentage (fixed at 0.9) and number of days remaining in the cover period divided by the day count basis and rounds to 2 decimal places', () => {
      // Arrange
      const utilisation = 100000;
      const interestPercentage = 5;
      const dayCountBasis = 365;

      const reportPeriod = getReportPeriodForDate(TODAY);
      const coverStartDateAfterReportPeriod = addMonths(TODAY, 1);

      // Number of days remaining = 368
      const coverEndDate = addDays(coverStartDateAfterReportPeriod, 368);

      // Act
      const result = calculateFixedFee({
        utilisation,
        interestPercentage,
        dayCountBasis,
        reportPeriod,
        coverStartDate: coverStartDateAfterReportPeriod,
        coverEndDate,
      });

      // Assert
      expect(result).toBe(4536.99); // 100000 * (5 / 100) * 0.9 * 368 / 365 = 4,536.98630... = 4,536.99 (ROUNDED)
    });
  });

  describe('when the report period starts after the cover start date', () => {
    it('returns the product of the utilisation, interest percentage (divided by 100), bank admin fee percentage (fixed at 0.9) and number of days remaining in the cover period divided by the day count basis and rounds to 2 decimal places', () => {
      // Arrange
      const utilisation = 100000;
      const interestPercentage = 5;
      const dayCountBasis = 365;

      const reportPeriod = getReportPeriodForDate(TODAY);
      const coverStartDateBeforeReportPeriod = subMonths(TODAY, 1);

      // Number of days remaining = 432
      const coverEndDate = addDays(startOfMonth(TODAY), 432);

      // Act
      const result = calculateFixedFee({
        utilisation,
        interestPercentage,
        dayCountBasis,
        reportPeriod,
        coverStartDate: coverStartDateBeforeReportPeriod,
        coverEndDate,
      });

      // Assert
      expect(result).toBe(5326.03); // 100000 * (5 / 100) * 0.9 * 432 / 365 = 5,326.02739... = 5,326.03 (ROUNDED)
    });
  });
});
