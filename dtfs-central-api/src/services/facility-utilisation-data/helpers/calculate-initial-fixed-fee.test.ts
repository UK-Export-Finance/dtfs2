import { addDays } from 'date-fns';
import { calculateInitialFixedFee, getNumberOfDaysInCoverPeriod } from './calculate-initial-fixed-fee';
import { calculateFixedFeeFromDaysRemaining } from '../../../helpers/calculate-fixed-fee-from-days-remaining';

describe('helpers/calculate-fixed-fee', () => {
  describe('getNumberOfDaysInCoverPeriod', () => {
    it('should return the difference in days between 2 dates', () => {
      const difference = 12;

      const today = new Date();
      const future = addDays(today, difference);

      const result = getNumberOfDaysInCoverPeriod(today, future);

      expect(result).toEqual(difference);
    });
  });

  describe('calculateFixedFee', () => {
    it('should return the value of "calculateFixedFeeFromDaysRemaining"', () => {
      const ukefShareOfUtilisation = 100000;
      const interestPercentage = 5;
      const dayCountBasis = 365;
      const coverStartDate = new Date();
      const coverEndDate = addDays(coverStartDate, 1);

      const result = calculateInitialFixedFee({
        ukefShareOfUtilisation,
        interestPercentage,
        dayCountBasis,
        coverStartDate,
        coverEndDate,
      });

      const numberOfDaysRemainingInCoverPeriod = getNumberOfDaysInCoverPeriod(coverStartDate, coverEndDate);

      const expected = calculateFixedFeeFromDaysRemaining({ ukefShareOfUtilisation, numberOfDaysRemainingInCoverPeriod, interestPercentage, dayCountBasis });

      expect(result).toEqual(expected);
    });
  });
});
