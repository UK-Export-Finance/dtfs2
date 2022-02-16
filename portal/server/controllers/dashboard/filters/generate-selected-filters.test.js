import {
  generateSelectedFiltersObject,
  generateSelectedFiltersObjectWithMappedValues,
  selectedSubmissionTypeFilters,
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
            text: formatFieldValue(mockSubmittedFieldFilters[0]),
            href: expectedHref(mockFieldName, formatFieldValue(mockSubmittedFieldFilters[0])),
            formattedValue: formatFieldValue(mockSubmittedFieldFilters[0]),
          },
          {
            text: formatFieldValue(mockSubmittedFieldFilters[1]),
            href: expectedHref(mockFieldName, formatFieldValue(mockSubmittedFieldFilters[1])),
            formattedValue: formatFieldValue(mockSubmittedFieldFilters[1]),
          },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('generateSelectedFiltersObjectWithMappedValues', () => {
    it('should return mapped object', () => {
      const mockHeading = CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE;
      const mockFieldName = CONSTANTS.FIELD_NAMES.FACILITY_HAS_BEEN_ISSUED;
      const mockSubmittedFieldFilters = [
        CONSTANTS.FACILITY_HAS_BEEN_ISSUED.ISSUED,
        CONSTANTS.FACILITY_HAS_BEEN_ISSUED.UNISSUED,
      ];

      const result = generateSelectedFiltersObjectWithMappedValues(
        mockHeading,
        mockFieldName,
        mockSubmittedFieldFilters,
      );

      const expectedTextValue = (str) => formatFieldValue(str);
      const expectedHref = (name, value) => `filters/remove/${name}/${value}`;

      const expected = {
        heading: {
          text: mockHeading,
        },
        items: [
          {
            text: expectedTextValue(mockSubmittedFieldFilters[0]),
            href: expectedHref(mockFieldName, mockSubmittedFieldFilters[0]),
            formattedValue: expectedTextValue(mockSubmittedFieldFilters[0]),
          },
          {
            text: expectedTextValue(mockSubmittedFieldFilters[1]),
            href: expectedHref(mockFieldName, mockSubmittedFieldFilters[1]),
            formattedValue: expectedTextValue(mockSubmittedFieldFilters[1]),
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
});
