const {
  mapCoverStartDate,
  mapFacilityStage,
  mapCashContingentFacility,
} = require('./map-cash-contingent-facility');
const { convertDateToTimestamp } = require('../../../utils/date');
const mapGefFacilityFeeType = require('../../../graphql/reducers/mappings/gef-facilities/mapGefFacilityFeeType');
const CONSTANTS = require('../../../constants');

const MOCK_CASH_CONTINGENT_FACILITIES = require('../../__mocks__/mock-cash-contingent-facilities');

describe('mappings - map submitted deal - mapCashContingentFacility', () => {
  describe('mapCoverStartDate', () => {
    it('should return coverStartDate as a timestamp', () => {
      const mockFacility = {
        hasBeenIssued: null,
        coverStartDate: '2021-12-12 00:00:00.000Z',
      };

      const result = mapCoverStartDate(mockFacility);

      const expected = convertDateToTimestamp(mockFacility.coverStartDate);

      expect(result).toEqual(expected);
    });

    describe('when coverStartDate is an invalid date and facility.hasBeenIssued is NOT true', () => {
      it('should return null', () => {
        const mockFacility = {
          hasBeenIssued: null,
          coverStartDate: '',
        };

        const result = mapCoverStartDate(mockFacility);

        expect(result).toEqual(null);
      });
    });

    it('should return null', () => {
      const result = mapCoverStartDate({});

      expect(result).toEqual(null);
    });
  });

  describe('mapFacilityStage', () => {
    describe('when passed flag is true', () => {
      it(`should return ${CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED}`, () => {
        const result = mapFacilityStage(true);

        expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED);
      });
    });

    it(`should otherwise return ${CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT}`, () => {
      const result = mapFacilityStage(false);

      expect(result).toEqual(CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT);
    });
  });

  describe('mapCashContingentFacility', () => {
    it('should return mapped facility', () => {
      const mockFacility = {
        ...MOCK_CASH_CONTINGENT_FACILITIES[0],
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
        interestPercentage,
        shouldCoverStartOnSubmission,
        hasBeenIssuedAndAcknowledged,
      } = mockFacility;

      const expected = {
        _id,
        ukefFacilityId,
        type,
        currencyCode: currency.id,
        value,
        coverPercentage,
        hasBeenIssued,
        ukefGuaranteeInMonths: monthsOfCover || 0,
        ukefExposure,
        coverStartDate: mapCoverStartDate(mockFacility),
        coverEndDate,
        coverEndDateTimestamp: convertDateToTimestamp(coverEndDate),
        bankReference: name,
        guaranteeFee,
        feeType: mapGefFacilityFeeType(paymentType),
        feeFrequency,
        dayCountBasis,
        interestPercentage,
        shouldCoverStartOnSubmission,
        facilityStage: mapFacilityStage(hasBeenIssued),
        tfm: mockFacility.tfm,
        hasBeenIssuedAndAcknowledged,
      };

      expect(result).toEqual(expected);
    });
  });
});
