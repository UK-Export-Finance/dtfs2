const { format } = require('date-fns');
const {
  mapIssuedValue,
  facilityFieldsObj,
  generateFacilityFieldListItemString,
  generateFacilityFieldsListString,
  generateFacilitiesListString,
  gefFacilitiesList,
} = require('./gef-facilities-list');
const { generateHeadingString, generateListItemString } = require('../../helpers/notify-template-formatters');
const CONSTANTS = require('../../../constants');
const CONTENT_STRINGS = require('./gef-facilities-content-strings');

const MOCK_CASH_CONTINGENT_FACILITIES = require('../../__mocks__/mock-cash-contingent-facilities');
const { mapCashContingentFacility } = require('../../mappings/map-submitted-deal/map-cash-contingent-facility');

describe('generate AIN/MIN confirmation email facilities list email variable/string  - GEF', () => {
  const mockFacility = mapCashContingentFacility(MOCK_CASH_CONTINGENT_FACILITIES[0]);

  const mockType = {
    name: 'type',
    value: 'Cash',
  };

  const mockBankReference = {
    name: 'bankReference',
    value: '123-test',
  };

  const mockDayCountBasis = {
    name: 'dayCountBasis',
    value: 365,
  };

  const mockSimpleFacility = {
    [mockType.name]: mockType.value,
    [mockBankReference.name]: mockBankReference.value,
    [mockDayCountBasis.name]: mockDayCountBasis.value,
  };

  describe('mapIssuedValue', () => {
    describe('when facility.hasBeenIssued is true', () => {
      it(`should return ${CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED}`, () => {
        const result = mapIssuedValue(true);
        const expected = CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.ISSUED;

        expect(result).toEqual(expected);
      });
    });

    describe('when facility.hasBeenIssued is false', () => {
      it(`should return ${CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED}`, () => {
        const result = mapIssuedValue(false);
        const expected = CONSTANTS.FACILITIES.FACILITY_STAGE_PORTAL.UNISSUED;

        expect(result).toEqual(expected);
      });
    });
  });

  describe('facilityFieldsObj', () => {
    it('should return and format specific fields from a facility object', () => {
      const result = facilityFieldsObj(mockFacility);

      const coverEndDate = new Date(mockFacility.coverEndDate);
      const expected = {
        ukefFacilityId: mockFacility.ukefFacilityId,
        bankReference: mockFacility.bankReference,
        hasBeenIssued: mapIssuedValue(mockFacility.hasBeenIssued),
        coverStartDate: format(Number(mockFacility.coverStartDate), 'do MMMM yyyy'),
        coverEndDate: format(Number(coverEndDate), 'do MMMM yyyy'),
        value: mockFacility.value,
        currencyCode: mockFacility.currencyCode,
        interestPercentage: `${mockFacility.interestPercentage}%`,
        coverPercentage: `${mockFacility.coverPercentage}%`,
        guaranteeFee: `${mockFacility.guaranteeFee}%`,
        ukefExposure: mockFacility.ukefExposure,
        feeType: mockFacility.feeType,
        feeFrequency: mockFacility.feeFrequency,
        dayCountBasis: mockFacility.dayCountBasis,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('generateFacilityFieldListItemString', () => {
    it('should return a formatted string with field value and name/title mapped from content strings', () => {
      const mockFieldName = 'bankReference';
      const mockFieldValue = '123-test';

      const result = generateFacilityFieldListItemString(mockType.value, mockFieldName, mockFieldValue);

      const expectedTitle = CONTENT_STRINGS.LIST_ITEM_TITLES[mockType.value?.toUpperCase()][mockFieldName];
      const expected = generateListItemString(`${expectedTitle}: ${mockFieldValue}`);

      expect(result).toEqual(expected);
    });
  });

  describe('generateFacilityFieldsListString', () => {
    it('should return a formatted string for multiple facility fields & values', () => {
      const result = generateFacilityFieldsListString(mockSimpleFacility);

      const formattedBankRef = generateFacilityFieldListItemString(mockType.value, mockBankReference.name, mockBankReference.value);

      const formattedDayCountBasis = generateFacilityFieldListItemString(mockType.value, mockDayCountBasis.name, mockDayCountBasis.value);

      const expected = `${formattedBankRef}${formattedDayCountBasis}`;

      expect(result).toEqual(expected);
    });
  });

  describe('generateFacilitiesListString', () => {
    it('should return a formatted string with heading and facility fields for each facility', () => {
      const mockFacilities = [mockSimpleFacility, mockSimpleFacility];
      const mockHeading = 'Test';

      const result = generateFacilitiesListString(mockHeading, mockFacilities);

      const expectedHeading = generateHeadingString(mockHeading);
      const expectedFacilityFields = generateFacilityFieldsListString(mockSimpleFacility);

      const expectedFacilityString = `\n\n${expectedHeading}${expectedFacilityFields}`;

      const expected = `${expectedFacilityString}${expectedFacilityString}`;

      expect(result).toEqual(expected);
    });
  });

  describe('gefFacilitiesList', () => {
    it('should return formatted list strings for both cash and contingent facilities', () => {
      const mockCashFacilities = [
        {
          ...mockFacility,
          type: 'Cash',
        },
      ];

      const mockContingentFacilities = [
        {
          ...mockFacility,
          type: 'Contingent',
        },
      ];

      const mockFacilities = [...mockCashFacilities, ...mockContingentFacilities];

      const result = gefFacilitiesList(mockFacilities);

      const expectedCashString = generateFacilitiesListString(CONTENT_STRINGS.HEADINGS.CASH, mockCashFacilities);

      const expectedContingentString = generateFacilitiesListString(CONTENT_STRINGS.HEADINGS.CONTINGENT, mockContingentFacilities);

      expect(result.cashes).toEqual(expectedCashString);
      expect(result.contingents).toEqual(expectedContingentString);
    });

    it('should return empty strings when no facilities exist', () => {
      const result = gefFacilitiesList([]);

      expect(result).toEqual({
        cashes: '',
        contingents: '',
      });
    });
  });
});
