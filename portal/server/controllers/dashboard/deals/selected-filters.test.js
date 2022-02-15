import {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
} from '../filters/generate-selected-filters';
import { selectedFilters } from './selected-filters';
import CONTENT_STRINGS from '../../../content-strings';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/deals - selected-filters', () => {
  describe('selectedFilters', () => {
    it('should return an array of objects for all selected/submitted filters', () => {
      const mockSubmittedFilters = {
        keyword: ['test'],
        dealType: [CONSTANTS.PRODUCT.GEF, CONSTANTS.PRODUCT.BSS_EWCS],
        submissionType: [CONSTANTS.SUBMISSION_TYPE.AIN],
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
        selectedSubmissionTypeFilters(
          CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE,
          mockSubmittedFilters[CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE],
        ),
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
