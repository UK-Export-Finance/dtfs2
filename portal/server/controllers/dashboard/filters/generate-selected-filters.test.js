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
        {
          value: CONSTANTS.FACILITY_HAS_BEEN_ISSUED.ISSUED,
          mappedValue: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
        },
        {
          value: CONSTANTS.FACILITY_HAS_BEEN_ISSUED.UNISSUED,
          mappedValue: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
        },
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
            text: expectedTextValue(mockSubmittedFieldFilters[0].mappedValue),
            href: expectedHref(mockFieldName, mockSubmittedFieldFilters[0].value),
            formattedValue: expectedTextValue(mockSubmittedFieldFilters[0].mappedValue),
          },
          {
            text: expectedTextValue(mockSubmittedFieldFilters[1].mappedValue),
            href: expectedHref(mockFieldName, mockSubmittedFieldFilters[1].value),
            formattedValue: expectedTextValue(mockSubmittedFieldFilters[1].mappedValue),
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
