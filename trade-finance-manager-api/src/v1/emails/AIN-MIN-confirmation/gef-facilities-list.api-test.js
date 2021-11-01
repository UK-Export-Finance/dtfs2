const {
  facilityFieldsObj,
  generateFacilityFieldListItemString,
  generateFacilityFieldsListString,
  generateFacilitiesListString,
  gefFacilitiesList,
} = require('./gef-facilities-list');
const {
  generateHeadingString,
  generateListItemString,
} = require('../../helpers/notify-template-formatters');
const CONTENT_STRINGS = require('./gef-facilities-content-strings');

const MOCK_CASH_CONTINGENT_FACILIIES = require('../../__mocks__/mock-cash-contingent-facilities');
const { mapCashContingentFacility } = require('../../mappings/map-submitted-deal/map-cash-contingent-facility');

describe('generate AIN/MIN confirmation email facilities list email variable/string  - GEF', () => {
  const mockFacility = mapCashContingentFacility(
    MOCK_CASH_CONTINGENT_FACILIIES[0],
  );

  const mockBankReference = {
    name: 'bankReference',
    value: '123-test',
  };

  const mockCoverPercentage = {
    name: 'coverPercentage',
    value: 20,
  };

  const mockSimpleFacility = {
    [mockBankReference.name]: mockBankReference.value,
    [mockCoverPercentage.name]: mockCoverPercentage.value,
  };

  describe('facilityFieldsObj', () => {
    it('should return specific fields from a facility object', () => {
      const result = facilityFieldsObj(mockFacility);

      const expected = {
        ukefFacilityID: mockFacility.ukefFacilityID,
        _id: mockFacility._id,
        bankReference: mockFacility.bankReference,
        hasBeenIssued: mockFacility.hasBeenIssued,
        coverStartDate: mockFacility.coverStartDate,
        value: mockFacility.value,
        currencyCode: mockFacility.currencyCode,
        interestPercentage: mockFacility.interestPercentage,
        coverPercentage: mockFacility.coverPercentage,
        guaranteeFee: mockFacility.guaranteeFee,
        ukefExposure: mockFacility.ukefExposure,
        feeType: mockFacility.feeType,
        feeFrequency: mockFacility.feeFrequency,
        dayCountBasis: mockFacility.dayCountBasis,
      };

      expect(result).toEqual(expected);
    });

    describe('when facility.shouldCoverStartOnSubmission is false', () => {
      it('should add requestedCoverStartDate field with the coverStartDate value, and not add shouldCoverStartOnSubmission', () => {
        const mockFacilityWithCoverStartOnSubmission = {
          ...mockFacility,
          shouldCoverStartOnSubmission: false,
        };

        const result = facilityFieldsObj(mockFacilityWithCoverStartOnSubmission);

        expect(result.requestedCoverStartDate).toEqual(mockFacility.coverStartDate);
        expect(result.shouldCoverStartOnSubmission).toBeUndefined();
      });
    });
  });

  describe('generateFacilityFieldListItemString', () => {
    it('should return a formatted string with field value and name/title mapped from content strings', () => {
      const mockFieldName = 'bankReference';
      const mockFieldValue = '123-test';

      const result = generateFacilityFieldListItemString(mockFieldName, mockFieldValue);

      const expectedTitle = CONTENT_STRINGS.LIST_ITEM_TITLES[mockFieldName];
      const expected = generateListItemString(`${expectedTitle}: ${mockFieldValue}`);

      expect(result).toEqual(expected);
    });
  });

  describe('generateFacilityFieldsListString', () => {
    it('should return a formatted string for multiple facility fields & values', () => {
      const result = generateFacilityFieldsListString(mockSimpleFacility);

      const formattedBankRef = generateFacilityFieldListItemString(
        mockBankReference.name,
        mockBankReference.value,
      );

      const formattedCoverPercentage = generateFacilityFieldListItemString(
        mockCoverPercentage.name,
        mockCoverPercentage.value,
      );

      const expected = `${formattedBankRef}${formattedCoverPercentage}`;

      expect(result).toEqual(expected);
    });
  });

  describe('generateFacilitiesListString', () => {
    it('should return a formatted string with heading and facility fields for each facility', () => {
      const mockFacilities = [
        mockSimpleFacility,
        mockSimpleFacility,
      ];
      const mockHeading = 'Test';

      const result = generateFacilitiesListString(mockHeading, mockFacilities);

      const expectedHeading = generateHeadingString(mockHeading);
      const expectedFacilityFields = generateFacilityFieldsListString(mockSimpleFacility);

      const expectedFacilityString = `${expectedHeading}${expectedFacilityFields}`;

      const expected = `${expectedFacilityString}${expectedFacilityString}`;

      expect(result).toEqual(expected);
    });
  });

  describe('gefFacilitiesList', () => {
    it('should return formatted list strings for both cash and contingent facilities', () => {
      const mockCashFacilities = [
        {
          ...mockFacility,
          facilityType: 'CASH',
        },
      ];

      const mockContingentFacilities = [
        {
          ...mockFacility,
          facilityType: 'CONTINGENT',
        },
      ];

      const mockFacilities = [
        ...mockCashFacilities,
        ...mockContingentFacilities,
      ];

      const result = gefFacilitiesList(mockFacilities);

      const expectedCashString = generateFacilitiesListString(
        CONTENT_STRINGS.HEADINGS.CASH,
        mockCashFacilities,
      );

      const expectedContingentString = generateFacilitiesListString(
        CONTENT_STRINGS.HEADINGS.CONTINGENT,
        mockContingentFacilities,
      );

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
