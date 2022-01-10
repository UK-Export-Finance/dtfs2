import {
  generateSelectedFiltersObject,
  selectedDashboardFilters,
} from './ui-selected-filters';
import CONTENT_STRINGS from '../../../content-strings';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/filters - ui-selected-filters', () => {
  describe('generateSelectedFiltersObject', () => {
    it('should return mapped object', () => {
      const mockHeading = 'Product';
      const mockFieldName = CONSTANTS.FIELD_NAMES.DEAL.DEAL_TYPE;
      const mockSubmittedFieldFilters = [
        CONSTANTS.PRODUCT.GEF,
        CONSTANTS.PRODUCT.BSS_EWCS,
      ];

      const result = generateSelectedFiltersObject(
        mockHeading,
        mockFieldName,
        mockSubmittedFieldFilters,
      );

      const expected = {
        heading: {
          text: mockHeading,
        },
        items: [
          { text: mockSubmittedFieldFilters[0], href: '#' },
          { text: mockSubmittedFieldFilters[1], href: '#' },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('selectedDashboardFilters', () => {
    it('should return an array of objects for all selected/submitted filters', () => {
      const mockSubmittedFilters = {
        dealType: [CONSTANTS.PRODUCT.GEF, CONSTANTS.PRODUCT.BSS_EWCS],
        submissionType: ['Automatic Inclusion Notice'],
        status: [CONSTANTS.STATUS.SUBMITTED],
      };

      const result = selectedDashboardFilters(mockSubmittedFilters);

      const expected = [
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
          mockSubmittedFilters.dealType,
        ),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.NOTICE_TYPE,
          mockSubmittedFilters.submissionType,
        ),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.STATUS,
          mockSubmittedFilters.status,
        ),
      ];

      expect(result).toEqual(expected);
    });

    describe('when there are no selected/submitted filters', () => {
      it('should return an empty array', () => {
        const result = selectedDashboardFilters({});

        expect(result).toEqual([]);
      });
    });
  });
});
