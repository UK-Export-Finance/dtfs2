const {
  hasCoverEndDate,
  mapCoverEndDate,
  mapBssEwcsFacility,
} = require('./map-bss-ewcs-facility');
const isIssued = require('../../helpers/is-issued');
const MOCK_FACILIIES = require('../../__mocks__/mock-facilities');

describe('mappings - map submitted deal - mapBssEwcsFacility', () => {
  describe('hasCoverEndDate', () => {
    it('should return false when day || month || year values are missing', () => {
      expect(hasCoverEndDate('', '2', '3')).toEqual(false);
      expect(hasCoverEndDate('1', '', '3')).toEqual(false);
      expect(hasCoverEndDate('1', '2', '')).toEqual(false);
    });

    it('should return true when day, month, year values exist', () => {
      const result = hasCoverEndDate('1', '2', '2021');
      expect(result).toEqual(true);
    });
  });

  describe('mapCoverEndDate', () => {
    it('should return date', () => {
      const result = mapCoverEndDate('1', '2', '2021');
      expect(result).toEqual(expect.any(Object)); // date object
    });
  });

  describe('mapBssEwcsFacility', () => {
    it('should return mapped facility', () => {
      const mockFacility = {
        ...MOCK_FACILIIES[0],
        tfm: {},
      };

      const result = mapBssEwcsFacility(mockFacility);

      const {
        _id,
        ukefFacilityID,
        facilityType,
        facilityValue,
        currency,
        coveredPercentage,
        ukefExposure,
        ukefGuaranteeInMonths,
        hasBeenAcknowledged,
        requestedCoverStartDate,
        dayCountBasis,
        guaranteeFeePayableByBank,
        feeType,
        premiumType,
        feeFrequency,
        premiumFrequency,
      } = mockFacility;

      const expected = {
        _id,
        ukefFacilityID,
        facilityType,
        currency,
        value: facilityValue,
        coverPercentage: coveredPercentage,
        ukefExposure,
        coverStartDate: requestedCoverStartDate,
        ukefGuaranteeInMonths,
        hasBeenIssued: isIssued(mockFacility),
        hasBeenAcknowledged,
        coverEndDate: expect.any(Object), // date object,
        guaranteeFeePayableByBank,
        dayCountBasis,
        feeFrequency,
        premiumFrequency,
        feeType,
        premiumType,
        tfm: mockFacility.tfm,
      };

      expect(result).toEqual(expected);
    });
  });
});
