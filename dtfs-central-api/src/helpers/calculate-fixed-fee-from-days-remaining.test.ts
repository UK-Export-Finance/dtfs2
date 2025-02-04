import { calculateFixedFeeFromDaysRemaining } from './calculate-fixed-fee-from-days-remaining';

describe('calculateFixedFeeFromDaysRemaining', () => {
  it('should return the product of the utilisation, interest percentage (divided by 100), bank admin fee percentage (fixed at 0.9) and number of days remaining in the cover period divided by the day count basis and rounds to 2 decimal places', () => {
    // Arrange
    const ukefShareOfUtilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    // Number of days remaining = 432
    const numberOfDaysRemainingInCoverPeriod = 432;

    // Act
    const result = calculateFixedFeeFromDaysRemaining({
      ukefShareOfUtilisation,
      numberOfDaysRemainingInCoverPeriod,
      interestPercentage,
      dayCountBasis,
    });

    // Assert
    // utilisation * (interestPercentage / 100) * BANK_ADMIN_FEE_ADJUSTMENT * numberOfDaysRemainingInCoverPeriod / dayCountBasis = 5,326.02739... = 5,326.03 (ROUNDED)
    expect(result).toEqual(5326.03);
  });
});
