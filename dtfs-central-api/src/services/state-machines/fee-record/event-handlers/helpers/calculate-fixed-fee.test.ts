import { ReportPeriod } from '@ukef/dtfs2-common';
import { calculateFixedFee } from './calculate-fixed-fee';

console.error = jest.fn();

describe('calculateFixedFeeAdjustment', () => {
  const getReportPeriodForDate = (date: Date): ReportPeriod => ({
    start: { month: date.getMonth() + 1, year: date.getFullYear() },
    end: { month: date.getMonth() + 1, year: date.getFullYear() },
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns the product of the utilisation, interest percentage (divided by 100), bank admin fee percentage (fixed at 0.9) and number of days remaining in the cover period divided by the day count basis and rounds to 2 decimal places', () => {
    // Arrange
    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const aDate = new Date(2024, 0, 1);

    const reportPeriod = getReportPeriodForDate(aDate);

    // Number of days of cover from end of report period to cover end date
    // is days between 1st Feb 2024 and 1st Sep 2024 = 213
    const coverEndDate = new Date(2024, 8, 1);

    // Act
    const result = calculateFixedFee({
      utilisation,
      interestPercentage,
      dayCountBasis,
      reportPeriod,
      coverEndDate,
    });

    // Assert
    expect(result).toBe(2626.03); // 100000 * (5 / 100) * 0.9 * 213 / 365 = 2,626.0274 = 2,626.03 (ROUNDED)
  });
});
