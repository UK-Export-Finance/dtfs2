import { FACILITY_STATUS } from '@ukef/dtfs2-common';
import { stageFilters } from './template-filters';
import { FIELD_NAMES } from '../../../constants';
import { DASHBOARD_FILTERS } from '../../../content-strings';
import { generateFiltersArray } from '../filters/generate-template-filters';

describe('controllers/dashboard/facilities - template-filters', () => {
  describe('stageFilters - FF_TFM_FACILITY_END_DATE_ENABLED enabled', () => {
    it('should return generateFiltersArray with all possible `facility stage` field inputs', () => {
      const mockSubmittedFilters = {};

      const result = stageFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED;

      const expectedFieldInputs = [
        {
          text: DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
          value: DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
        },
        {
          text: DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
          value: DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
        },
        {
          text: FACILITY_STATUS.RISK_EXPIRED,
          value: FACILITY_STATUS.RISK_EXPIRED,
        },
      ];

      const expected = generateFiltersArray(expectedFieldName, expectedFieldInputs, mockSubmittedFilters);

      expect(result).toEqual(expected);
    });
  });
});
