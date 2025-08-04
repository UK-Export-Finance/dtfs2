const { differenceInDays } = require('date-fns');
const { calculateDrawnAmount } = require('@ukef/dtfs2-common');
const { calculateDaysOfCover, calculateFeeAmount, calculateGefFacilityFeeRecord } = require('@ukef/dtfs2-common');

describe('calculate-gef-facility-fee-record', () => {
  // for drawn amount
  const mockFacilityValue = 150000;
  const mockCoverPercentage = 20;

  // for days of cover
  const mockCoverStartDate = '1636379303330';
  const mockCoverEndDate = '1701388800000';

  // for fee amount
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

      const result = calculateFeeAmount(drawnAmount, daysOfCover, mockDayBasis, mockGuaranteeFee);

      const expected = (drawnAmount * daysOfCover * (mockGuaranteeFee / 100)) / mockDayBasis;

      expect(result).toEqual(expected);
    });
  });

  describe('calculateGefFacilityFeeRecord', () => {
    it('should return result of all calculations passed to calculateFeeAmount', () => {
      const mockFacility = {
        hasBeenIssued: true,
        guaranteeFee: mockGuaranteeFee,
        dayCountBasis: mockDayBasis,
        value: mockFacilityValue,
        coverPercentage: mockCoverPercentage,
        coverStartDate: mockCoverStartDate,
        coverEndDate: mockCoverEndDate,
      };

      const result = calculateGefFacilityFeeRecord(mockFacility);

      const drawnAmount = calculateDrawnAmount(mockFacilityValue, mockCoverPercentage, mockGuaranteeFee);
      const daysOfCover = calculateDaysOfCover(mockCoverStartDate, mockCoverEndDate);
      const expected = calculateFeeAmount(drawnAmount, daysOfCover, mockFacility.dayCountBasis, mockGuaranteeFee);

      expect(result).toEqual(expected);
    });
  });
});
