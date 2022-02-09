import {
  generateSelectedFiltersObject,
  selectedSubmissionTypeFilters,
} from '../filters/generate-selected-filters';
import { selectedFilters } from './selected-filters';
import { formatFieldValue } from '../filters/helpers';
import CONTENT_STRINGS from '../../../content-strings';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/facilities - selected-filters', () => {
  describe('selectedFilters', () => {
    it('should return an array of objects for all selected/submitted filters', () => {
      const mockSubmittedFilters = {
        type: [CONSTANTS.FACILITY_TYPE.BOND, CONSTANTS.FACILITY_TYPE.LOAN],
        'deal.submissionType': [CONSTANTS.SUBMISSION_TYPE.AIN],
        hasBeenIssued: ['true'],
      };

      const result = selectedFilters(mockSubmittedFilters);

      const expected = [
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
          CONSTANTS.FIELD_NAMES.FACILITY.TYPE,
          mockSubmittedFilters.type,
        ),
        selectedSubmissionTypeFilters(mockSubmittedFilters[CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE]),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE,
          CONSTANTS.FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED,
          mockSubmittedFilters.hasBeenIssued,
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
