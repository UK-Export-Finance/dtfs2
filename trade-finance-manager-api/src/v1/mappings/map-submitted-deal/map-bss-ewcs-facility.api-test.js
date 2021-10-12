const {
  hasCoverEndDate,
  mapCoverEndDate,
  mapBssEwcsFacility,
} = require('./map-bss-ewcs-facility');
const isIssued = require('../../helpers/is-issued');
const { stripCommas } = require('../../../utils/string');
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
        ...MOCK_FACILIIES[1],
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
        premiumType,
        feeFrequency,
        bankReferenceNumber,
        uniqueIdentificationNumber,
        disbursementAmount,
        facilityStage,
      } = mockFacility;

      const expected = {
        _id,
        ukefFacilityID: Number(ukefFacilityID),
        facilityType,
        currencyCode: currency.id,
        value: Number(facilityValue.replace(/,/g, '')),
        coverPercentage: Number(coveredPercentage),
        ukefExposure: Number(ukefExposure.split('.')[0].replace(/,/g, '')),
        coverStartDate: requestedCoverStartDate,
        ukefGuaranteeInMonths,
        hasBeenIssued: isIssued(facilityStage),
        hasBeenAcknowledged,
        coverEndDate: expect.any(Object),
        guaranteeFee: Number(guaranteeFeePayableByBank),
        feeType: premiumType,
        feeFrequency,
        dayCountBasis,
        disbursementAmount: disbursementAmount && Number(stripCommas(disbursementAmount)),
        bankReference: bankReferenceNumber,
        uniqueIdentificationNumber,
        tfm: mockFacility.tfm,
      };

      expect(result).toEqual(expected);
    });

    describe('when there is no feeType', () => {
      it('should use premiumType for feeType', () => {
        const mockFacility = {
          ...MOCK_FACILIIES[0],
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
          ...MOCK_FACILIIES[0],
          feeFrequency: null,
          tfm: {},
        };

        const result = mapBssEwcsFacility(mockFacility);

        expect(result.feeFrequency).toEqual(mockFacility.premiumFrequency);
      });
    });
  });
});
