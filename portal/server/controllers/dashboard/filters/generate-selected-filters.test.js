import {
  generateSelectedFiltersObject,
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

      const result = selectedSubmissionTypeFilters(mockSubmittedFieldFilters);

      const expected = generateSelectedFiltersObject(
        CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE,
        CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
        mockSubmittedFieldFilters,
      );

      expect(result).toEqual(expected);
    });
  });
});
