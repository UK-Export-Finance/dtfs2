import { addDays, startOfMonth, subMonths } from 'date-fns';
import { calculateFixedFeeFromDaysRemaining } from './calculate-fixed-fee-from-days-remaining';
import { getNumberOfDaysInCoverPeriod } from '../services/state-machines/utilisation-report/event-handlers/helpers/calculate-fixed-fee';

describe('calculateFixedFeeFromDaysRemaining', () => {
  it('should return the product of the utilisation, interest percentage (divided by 100), bank admin fee percentage (fixed at 0.9) and number of days remaining in the cover period divided by the day count basis and rounds to 2 decimal places', () => {
    // Arrange
    const utilisation = 100000;
    const interestPercentage = 5;
    const dayCountBasis = 365;

    const coverStartDateBeforeReportPeriod = subMonths(new Date(), 1);

    // Number of days remaining = 432
    const coverEndDate = addDays(startOfMonth(new Date()), 432);

    const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysInCoverPeriod(coverStartDateBeforeReportPeriod, coverEndDate);

    // Act
    const result = calculateFixedFeeFromDaysRemaining({
      utilisation,
      numberOfDaysRemainingInCoverPeriod,
      interestPercentage,
      dayCountBasis,
    });

    // Assert
    expect(result).toBe(5671.23); // 100000 * (5 / 100) * 0.9 * 4603 / 365 = 5,671.2328767... = 5671.23 (ROUNDED)
  });
});
