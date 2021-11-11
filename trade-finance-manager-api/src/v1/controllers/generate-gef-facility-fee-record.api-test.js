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
  const mockCoverStartDate = '2021-12-01T00:00:00.000Z';
  const mockCoverEndDate = '2023-12-01T00:00:00.000Z';

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
        mockCoverEndDate,
      );

      const expected = differenceInDays(
        new Date(mockCoverEndDate),
        new Date(mockCoverStartDate),
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
        mockCoverEndDate,
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
        interestPercentage: mockInterestPercentage,
        dayCountBasis: mockDayBasis,
        value: mockFacilityValue,
        coverPercentage: mockCoverPercentage,
        coverStartDate: mockCoverStartDate,
        coverEndDate: mockCoverEndDate,
      };

      const result = generateGefFacilityFeeRecord(mockFacility);

      const drawnAmount = calculateDrawnAmount(
        mockFacilityValue,
        mockCoverPercentage,
      );

      const daysOfCover = calculateDaysOfCover(
        mockCoverStartDate,
        mockCoverEndDate,
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
