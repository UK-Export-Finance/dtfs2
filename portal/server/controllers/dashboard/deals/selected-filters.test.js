import {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
} from '../filters/generate-selected-filters';
import { selectedFilters } from './selected-filters';
import { formatFieldValue } from '../filters/helpers';
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

  describe('selectedFilters', () => {
    it('should return an array of objects for all selected/submitted filters', () => {
      const mockSubmittedFilters = {
        keyword: ['test'],
        dealType: [CONSTANTS.PRODUCT.GEF, CONSTANTS.PRODUCT.BSS_EWCS],
        'deal.submissionType': [CONSTANTS.SUBMISSION_TYPE.AIN],
        status: [CONSTANTS.STATUS.SUBMITTED],
      };

      const result = selectedFilters(mockSubmittedFilters);

      const expected = [
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.KEYWORD,
          'keyword',
          mockSubmittedFilters.keyword,
        ),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
          CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE,
          mockSubmittedFilters.dealType,
        ),
        selectedSubmissionTypeFilters(mockSubmittedFilters[CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE]),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.STATUS,
          CONSTANTS.FIELD_NAMES.DEAL.STATUS,
          mockSubmittedFilters.status,
        ),
      ];

      expect(result).toEqual(expected);
    });

    describe('when there are no selected/submitted filters', () => {
      it('should return an empty array', () => {
        const result = selectedFilters({});

        expect(result).toEqual([]);
      });
    });
  });
});
