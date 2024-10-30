import { calculateFixedFee } from './calculate-fixed-fee';

console.error = jest.fn();

describe('calculateFixedFeeAdjustment', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the correct calculation for the fixed fee for monthly report period', () => {
    // Arrange
    const ukefShareOfUtilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = { start: { month: 1, year: 2024 }, end: { month: 1, year: 2024 } };

    // Number of days of cover from end of report period to cover end date
    // is days between 1st Feb 2024 and 1st Sep 2024 = 213
    const coverEndDate = new Date(2024, 8, 1);

    // Act
    const result = calculateFixedFee({
      ukefShareOfUtilisation,
      reportPeriod,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });

    // Assert
    expect(result).toEqual(2626.03); // 100000 * (5 / 100) * 0.9 * 213 / 365 = 2,626.0274 = 2,626.03 (ROUNDED)
  });

  it('should return the correct calculation for the fixed fee for quarterly report period', () => {
    // Arrange
    const ukefShareOfUtilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const reportPeriod = { start: { month: 11, year: 2023 }, end: { month: 1, year: 2024 } };

    // Number of days of cover from end of report period to cover end date
    // is days between 1st Feb 2024 and 1st Sep 2024 = 213
    const coverEndDate = new Date(2024, 8, 1);

    // Act
    const result = calculateFixedFee({
      ukefShareOfUtilisation,
      reportPeriod,
      coverEndDate,
      interestPercentage,
      dayCountBasis,
    });

    // Assert
    expect(result).toEqual(2626.03); // 100000 * (5 / 100) * 0.9 * 213 / 365 = 2,626.0274 = 2,626.03 (ROUNDED)
  });
});
