const { differenceInDays } = require('date-fns');
const {
  calculateDrawnAmount,
  calculateDaysOfCover,
  calculateFeeAmount,
  generateGefFacilityFeeRecord,
} = require('./generate-gef-facility-fee-record');
const { formattedNumber } = require('../../utils/number');

describe('generate-gef-facility-fee-record', () => {
  // for drawn amount
  const mockFacilityValue = 150000;
  const mockCoverPercentage = 20;

  // for days of cover
  const mockCoverStartDate = '1636379303330';
  const mockCoverEndDateTimestamp = '1701388800000';

  // for fee amount
  const mockInterestPercentage = 12;
  const mockDayBasis = 365;

  describe('calculateDrawnAmount', () => {
    it('should return correct calculation', () => {
      const result = calculateDrawnAmount(mockFacilityValue, mockCoverPercentage);

      const valueAndCover = (mockFacilityValue * mockCoverPercentage);
      const tenPercent = (valueAndCover * 10 / 100);

      const drawnAmount = (valueAndCover * tenPercent);

      const expected = drawnAmount;
      
      expect(result).toEqual(expected);
    });
  });

  describe('calculateDaysOfCover', () => {
    it('should return the amount of days between start and end cover dates', () => {
      const result = calculateDaysOfCover(
        mockCoverStartDate,
        mockCoverEndDateTimestamp,
      );

      const expected = differenceInDays(
        new Date(Number(mockCoverEndDateTimestamp)),
        new Date(Number(mockCoverStartDate)),
      );

      expect(result).toEqual(expected);
      expect(typeof result).toEqual('number');
    });
  });

  describe('calculateFeeAmount', () => {
    it('should return correct calculation', () => {
      const drawnAmount = calculateDrawnAmount(
        mockFacilityValue,
        mockCoverPercentage,
      );

      const daysOfCover = calculateDaysOfCover(
        mockCoverStartDate,
        mockCoverEndDateTimestamp,
      );

      const result = calculateFeeAmount(
        drawnAmount,
        daysOfCover,
        mockInterestPercentage,
        mockDayBasis,
      );

      const drawnAmountAndDays = (drawnAmount * daysOfCover);

      const amountMultipliedByInterest = (drawnAmountAndDays * mockInterestPercentage);

      const expected = (amountMultipliedByInterest / mockDayBasis);

      expect(result).toEqual(expected);
    });
  });

  describe('generateGefFacilityFeeRecord', () => {
    it('should return result of all calculations passed to calculateFeeAmount', () => {
      const mockFacility = {
        hasBeenIssued: true,
        interestPercentage: mockInterestPercentage,
        dayCountBasis: mockDayBasis,
        value: mockFacilityValue,
        coverPercentage: mockCoverPercentage,
        coverStartDate: mockCoverStartDate,
        coverEndDateTimestamp: mockCoverEndDateTimestamp,
      };

      const result = generateGefFacilityFeeRecord(mockFacility);

      const drawnAmount = calculateDrawnAmount(
        mockFacilityValue,
        mockCoverPercentage,
      );

      const daysOfCover = calculateDaysOfCover(
        mockCoverStartDate,
        mockCoverEndDateTimestamp,
      );

      const expected = calculateFeeAmount(
        drawnAmount,
        daysOfCover,
        mockFacility.interestPercentage,
        mockFacility.dayCountBasis,
      );

      expect(result).toEqual(expected);
    });
  });
});
