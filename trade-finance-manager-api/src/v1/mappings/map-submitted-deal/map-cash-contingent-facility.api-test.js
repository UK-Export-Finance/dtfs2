const {
  mapCoverStartDate,
  mapCashContingentFacility,
} = require('./map-cash-contingent-facility');
const { convertDateToTimestamp } = require('../../../utils/date');
const mapGefFacilityFeeType = require('../../../graphql/reducers/mappings/gef-facilities/mapGefFacilityFeeType');

const MOCK_CASH_CONTINGENT_FACILIIES = require('../../__mocks__/mock-cash-contingent-facilities');

describe('mappings - map submitted deal - mapCashContingentFacility', () => {
  describe('mapCoverStartDate', () => {
    it('should return facility.submittedAsIssuedDate when facility.hasBeenIssued is true', () => {
      const mockFacility = {
        hasBeenIssued: true,
        submittedAsIssuedDate: '1628770126495',
      };

      const result = mapCoverStartDate(mockFacility);

      expect(result).toEqual(mockFacility.submittedAsIssuedDate);
    });

    it('should return coverStartDate as a timestamp when facility.hasBeenIssued is NOT true', () => {
      const mockFacility = {
        hasBeenIssued: null,
        coverStartDate: '2021-12-12 00:00:00.000Z',
      };

      const result = mapCoverStartDate(mockFacility);

      const expected = convertDateToTimestamp(mockFacility.coverStartDate);

      expect(result).toEqual(expected);
    });

    it('should return null', () => {
      const result = mapCoverStartDate({});

      expect(result).toEqual(null);
    });
  });

  describe('mapCashContingentFacility', () => {
    it('should return mapped facility', () => {
      const mockFacility = {
        ...MOCK_CASH_CONTINGENT_FACILIIES[0],
        tfm: {},
      };

      const result = mapCashContingentFacility(mockFacility);

      const {
        _id,
        ukefFacilityId,
        type,
        hasBeenIssued,
        value,
        currency,
        monthsOfCover,
        coverPercentage,
        ukefExposure,
        coverEndDate,
        name,
        guaranteeFee,
        paymentType,
        feeFrequency,
        dayCountBasis,
      } = mockFacility;

      const expected = {
        _id,
        ukefFacilityID: Number(ukefFacilityId),
        facilityType: type,
        currencyCode: currency,
        value,
        coverPercentage,
        hasBeenIssued,
        ukefGuaranteeInMonths: monthsOfCover || 0,
        ukefExposure,
        coverStartDate: mapCoverStartDate(mockFacility),
        coverEndDate,
        bankReference: name,
        guaranteeFee,
        feeType: mapGefFacilityFeeType(paymentType),
        feeFrequency,
        dayCountBasis,
        tfm: mockFacility.tfm,
      };

      expect(result).toEqual(expected);
    });
  });
});
