import { FACILITY_STAGE } from '@ukef/dtfs2-common';
import { stageFilters } from './template-filters';
import { FIELD_NAMES } from '../../../constants';
import { generateFiltersArray } from '../filters/generate-template-filters';

describe('controllers/dashboard/facilities - template-filters', () => {
  describe('facility stage filters - FF_TFM_DEAL_CANCELLATION_ENABLED enabled', () => {
    it('should return generateFiltersArray with all possible `facility stage` field inputs', () => {
      const mockSubmittedFilters = {};

      const result = stageFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED;

      const expectedFieldInputs = [
        {
          text: FACILITY_STAGE.ISSUED,
          value: FACILITY_STAGE.ISSUED,
        },
        {
          text: FACILITY_STAGE.UNISSUED,
          value: FACILITY_STAGE.UNISSUED,
        },
        {
          text: FACILITY_STAGE.RISK_EXPIRED,
          value: FACILITY_STAGE.RISK_EXPIRED,
        },
      ];

      const expected = generateFiltersArray(expectedFieldName, expectedFieldInputs, mockSubmittedFilters);

      expect(result).toEqual(expected);
    });
  });
});
