const { differenceInDays } = require('date-fns');
const { calculateDaysOfCover, calculateFeeAmount, calculateGefFacilityFeeRecord, calculateDrawnAmount, FACILITY_TYPE } = require('@ukef/dtfs2-common');

describe('calculate-gef-facility-fee-record', () => {
  // Facility
  const mockType = FACILITY_TYPE.CASH;

  // Drawn amount
  const mockFacilityValue = 80000;
  const mockCoverPercentage = 80;

  // Days of cover
  const mockCoverStartDate = '1744066800000';
  const mockCoverEndDate = '1901833200000';

  // Fee amount
  const mockInterestPercentage = 7.2;
  const mockGuaranteeFee = 6.91;
  const mockDayBasis = 365;

  describe('calculateDaysOfCover', () => {
    it('should return the amount of days between start and end cover dates for a cash facility', () => {
      const result = calculateDaysOfCover(mockCoverStartDate, mockCoverEndDate);

      const expected = differenceInDays(FACILITY_TYPE.CASH, new Date(Number(mockCoverEndDate)), new Date(Number(mockCoverStartDate)));

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
        type: FACILITY_TYPE.CASH,
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
      const daysOfCover = calculateDaysOfCover(FACILITY_TYPE.CASH, mockCoverStartDate, mockCoverEndDate);
      const expected = calculateFeeAmount(drawnAmount, daysOfCover, mockFacility.dayCountBasis, mockInterestPercentage);

      expect(result).toEqual(expected);
    });
  });
});
