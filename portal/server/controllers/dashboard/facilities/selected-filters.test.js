import { FACILITY_STAGE, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { generateSelectedFiltersObject, selectedSubmissionTypeFilters } from '../filters/generate-selected-filters';
import { selectedFilters } from './selected-filters';
import CONTENT_STRINGS from '../../../content-strings';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/facilities - selected-filters', () => {
  describe('selectedFilters', () => {
    it('should return an array of objects for all selected/submitted filters', () => {
      const mockSubmittedFilters = {
        keyword: ['Testing'],
        type: [FACILITY_TYPE.BOND, FACILITY_TYPE.LOAN],
        'deal.submissionType': [CONSTANTS.SUBMISSION_TYPE.AIN],
        stage: [FACILITY_STAGE.RISK_EXPIRED],
      };

      const result = selectedFilters(mockSubmittedFilters);

      const expected = [
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.KEYWORD,
          CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD,
          mockSubmittedFilters.keyword,
        ),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.PRODUCT,
          CONSTANTS.FIELD_NAMES.FACILITY.TYPE,
          mockSubmittedFilters.type,
        ),
        selectedSubmissionTypeFilters(
          `deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`,
          mockSubmittedFilters[`deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`],
        ),
        generateSelectedFiltersObject(
          CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE,
          CONSTANTS.FIELD_NAMES.FACILITY.STAGE,
          mockSubmittedFilters.stage,
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
