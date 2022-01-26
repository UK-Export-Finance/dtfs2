const {
  hasCoverEndDate,
  mapCoverEndDate,
  mapBssEwcsFacility,
} = require('./map-bss-ewcs-facility');
const isIssued = require('../../helpers/is-issued');
const { stripCommas } = require('../../../utils/string');
const { MOCK_FACILITIES } = require('../../__mocks__/mock-facilities');

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
        ...MOCK_FACILITIES[1],
        tfm: {},
      };

      const result = mapBssEwcsFacility(mockFacility);

      const {
        _id,
        ukefFacilityId,
        type,
        value,
        currency,
        coveredPercentage,
        ukefExposure,
        ukefGuaranteeInMonths,
        hasBeenAcknowledged,
        requestedCoverStartDate,
        dayCountBasis,
        guaranteeFeePayableByBank,
        premiumType,
        feeFrequency,
        name,
        disbursementAmount,
        facilityStage,
      } = mockFacility;

      const expected = {
        _id,
        ukefFacilityId: Number(ukefFacilityId),
        type,
        currencyCode: currency.id,
        value: Number(value.replace(/,/g, '')),
        coverPercentage: Number(coveredPercentage),
        ukefExposure: Number(ukefExposure.split('.')[0].replace(/,/g, '')),
        ukefGuaranteeInMonths,
        hasBeenIssued: isIssued(facilityStage),
        hasBeenAcknowledged,
        coverStartDate: requestedCoverStartDate,
        coverEndDate: expect.any(Object),
        guaranteeFee: Number(guaranteeFeePayableByBank),
        feeType: premiumType,
        feeFrequency,
        dayCountBasis: Number(dayCountBasis),
        disbursementAmount: disbursementAmount && Number(stripCommas(disbursementAmount)),
        name,
        tfm: mockFacility.tfm,
      };

      expect(result).toEqual(expected);
    });

    describe('when there is no feeType', () => {
      it('should use premiumType for feeType', () => {
        const mockFacility = {
          ...MOCK_FACILITIES[0],
          feeType: null,
          tfm: {},
        };

        const result = mapBssEwcsFacility(mockFacility);

        expect(result.feeType).toEqual(mockFacility.premiumType);
      });
    });

    describe('when there is no feeFrequency', () => {
      it('should use premiumFrequency for feeFrequency', () => {
        const mockFacility = {
          ...MOCK_FACILITIES[0],
          feeFrequency: null,
          tfm: {},
        };

        const result = mapBssEwcsFacility(mockFacility);

        expect(result.feeFrequency).toEqual(mockFacility.premiumFrequency);
      });
    });
  });
});
