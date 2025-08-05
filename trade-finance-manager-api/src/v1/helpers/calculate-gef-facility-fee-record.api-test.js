const { differenceInDays } = require('date-fns');
const { calculateDaysOfCover, calculateFeeAmount, calculateGefFacilityFeeRecord, calculateDrawnAmount, FACILITY_TYPE } = require('@ukef/dtfs2-common');

describe('calculate-gef-facility-fee-record', () => {
  // Facility
  const mockType = FACILITY_TYPE.CASH;

  // Drawn amount
  const mockFacilityValue = 150000;
  const mockCoverPercentage = 20;

  // Days of cover
  const mockCoverStartDate = '1636379303330';
  const mockCoverEndDate = '1701388800000';

  // Fee amount
  const mockInterestPercentage = 5;
  const mockGuaranteeFee = 3.6;
  const mockDayBasis = 365;

  describe('calculateDaysOfCover', () => {
    it('should return the amount of days between start and end cover dates', () => {
      const result = calculateDaysOfCover(mockCoverStartDate, mockCoverEndDate);

      const expected = differenceInDays(new Date(Number(mockCoverEndDate)), new Date(Number(mockCoverStartDate)));

      expect(result).toEqual(expected);
      expect(typeof result).toEqual('number');
    });
  });

  describe('calculateFeeAmount', () => {
    it('should return correct calculation', () => {
      const drawnAmount = calculateDrawnAmount(mockFacilityValue, mockCoverPercentage);

      const daysOfCover = calculateDaysOfCover(mockCoverStartDate, mockCoverEndDate);

      const result = calculateFeeAmount(drawnAmount, daysOfCover, mockDayBasis, mockInterestPercentage);

      const expected = (drawnAmount * daysOfCover * (mockInterestPercentage / 100)) / mockDayBasis;

      expect(result).toEqual(expected);
    });
  });

  describe('calculateGefFacilityFeeRecord', () => {
    it('should return result of all calculations passed to calculateFeeAmount', () => {
      const mockFacility = {
        hasBeenIssued: true,
        interestPercentage: mockInterestPercentage,
        guaranteeFee: mockGuaranteeFee,
        dayCountBasis: mockDayBasis,
        value: mockFacilityValue,
        coverPercentage: mockCoverPercentage,
        coverStartDate: mockCoverStartDate,
        coverEndDate: mockCoverEndDate,
      };

      const result = calculateGefFacilityFeeRecord(mockFacility);

      const drawnAmount = calculateDrawnAmount(mockFacilityValue, mockCoverPercentage, mockType);
      const daysOfCover = calculateDaysOfCover(mockCoverStartDate, mockCoverEndDate);
      const expected = calculateFeeAmount(drawnAmount, daysOfCover, mockFacility.dayCountBasis, mockInterestPercentage);

      expect(result).toEqual(expected);
    });
  });
});
