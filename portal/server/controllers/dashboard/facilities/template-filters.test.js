import { FACILITY_STATUS, FACILITY_TYPE } from '@ukef/dtfs2-common';
import { typeFilters, facilitiesTemplateFilters, createdByYouFilter, stageFilters } from './template-filters';
import { FIELD_NAMES } from '../../../constants';
import { DASHBOARD_FILTERS } from '../../../content-strings';
import { generateFiltersArray, submissionTypeFilters } from '../filters/generate-template-filters';

describe('controllers/dashboard/facilities - template-filters', () => {
  describe('typeFilters', () => {
    it('should return generateFiltersArray with all possible `product` field inputs', () => {
      const mockSubmittedFilters = {};

      const result = typeFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.FACILITY.TYPE;

      const expectedFieldInputs = [
        { text: FACILITY_TYPE.CASH, value: FACILITY_TYPE.CASH },
        { text: FACILITY_TYPE.CONTINGENT, value: FACILITY_TYPE.CONTINGENT },
        { text: FACILITY_TYPE.BOND, value: FACILITY_TYPE.BOND },
        { text: FACILITY_TYPE.LOAN, value: FACILITY_TYPE.LOAN },
      ];

      const expected = generateFiltersArray(expectedFieldName, expectedFieldInputs, mockSubmittedFilters);

      expect(result).toEqual(expected);
    });
  });

  describe('stageFilters', () => {
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

  describe('facilitiesTemplateFilters', () => {
    it('should return an object of all filters', () => {
      const result = facilitiesTemplateFilters();

      const expected = {
        createdBy: createdByYouFilter({}),
        type: typeFilters({}),
        'deal.submissionType': submissionTypeFilters(`deal.${FIELD_NAMES.DEAL.SUBMISSION_TYPE}`, {}),
        stage: stageFilters({}),
      };

      expect(result).toEqual(expected);
    });
  });
});
