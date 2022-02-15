import {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
  mapIssuedValueToText,
  selectedHasBeenIssuedFilters,
} from './generate-selected-filters';
import { formatFieldValue } from './helpers';
import CONTENT_STRINGS from '../../../content-strings';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/filters - ui-selected-filters', () => {
  describe('generateSelectedFiltersObject', () => {
    it('should return mapped object', () => {
      const mockHeading = CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT;
      const mockFieldName = CONSTANTS.FIELD_NAMES.DEAL_TYPE;
      const mockSubmittedFieldFilters = [
        CONSTANTS.PRODUCT.GEF,
        CONSTANTS.PRODUCT.BSS_EWCS,
      ];

      const result = generateSelectedFiltersObject(
        mockHeading,
        mockFieldName,
        mockSubmittedFieldFilters,
      );

      const expectedHref = (name, value) => `filters/remove/${name}/${value}`;

      const expected = {
        heading: {
          text: mockHeading,
        },
        items: [
          {
            text: mockSubmittedFieldFilters[0],
            href: expectedHref(mockFieldName, formatFieldValue(mockSubmittedFieldFilters[0])),
            formattedFieldValue: formatFieldValue(mockSubmittedFieldFilters[0]),
          },
          {
            text: mockSubmittedFieldFilters[1],
            href: expectedHref(mockFieldName, formatFieldValue(mockSubmittedFieldFilters[1])),
            formattedFieldValue: formatFieldValue(mockSubmittedFieldFilters[1]),
          },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('selectedSubmissionTypeFilters', () => {
    it('should return result of generateSelectedFiltersObject with provided params', () => {
      const mockSubmittedFieldFilters = [
        CONSTANTS.SUBMISSION_TYPE.AIN,
        CONSTANTS.SUBMISSION_TYPE.MIN,
      ];

      const result = selectedSubmissionTypeFilters(
        CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
        mockSubmittedFieldFilters,
      );

      const expected = generateSelectedFiltersObject(
        CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE,
        CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
        mockSubmittedFieldFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('mapIssuedValueToText', () => {
    it(`should return ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED} when true string is passed`, () => {
      const mockValue = true;

      const result = mapIssuedValueToText(mockValue);

      const expected = CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED;
      expect(result).toEqual(expected);
    });

    it(`should return ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED} when false string is passed`, () => {
      const mockValue = false;

      const result = mapIssuedValueToText(mockValue);

      const expected = CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED;
      expect(result).toEqual(expected);
    });
  });

  describe('selectedHasBeenIssuedFilters', () => {
    it('should return result of generateSelectedFiltersObject with mapped hasBeenIssuedValues', () => {
      const mockHeading = CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE;
      const mockFieldName = CONSTANTS.FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED;
      const mockSubmittedFieldFilters = [
        'true',
        'false',
      ];

      const result = selectedHasBeenIssuedFilters(
        mockHeading,
        mockFieldName,
        mockSubmittedFieldFilters,
      );

      const mappedSubmittedFieldFilters = mockSubmittedFieldFilters.map((value) =>
        mapIssuedValueToText(value));

      const expected = generateSelectedFiltersObject(
        mockHeading,
        mockFieldName,
        mappedSubmittedFieldFilters,
      );

      expect(result).toEqual(expected);
    });
  });
});
