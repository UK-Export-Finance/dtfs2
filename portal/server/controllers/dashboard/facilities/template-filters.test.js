import {
  typeFilters,
  hasBeenIssuedFilters,
  facilitiesTemplateFilters,
} from './template-filters';
import {
  FIELD_NAMES,
  FACILITY_HAS_BEEN_ISSUED,
  FACILITY_TYPE,
} from '../../../constants';
import CONTENT_STRINGS from '../../../content-strings';
import {
  generateFiltersArray,
  submissionTypeFilters,
} from '../filters/generate-template-filters';

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

      const expected = generateFiltersArray(
        expectedFieldName,
        expectedFieldInputs,
        mockSubmittedFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('hasBeenIssuedFilters', () => {
    it('should return generateFiltersArray with all possible `facility stage` field inputs', () => {
      const mockSubmittedFilters = {};

      const result = hasBeenIssuedFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED;

      const expectedFieldInputs = [
        {
          text: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED,
          value: FACILITY_HAS_BEEN_ISSUED.ISSUED,
        },
        {
          text: CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED,
          value: FACILITY_HAS_BEEN_ISSUED.UNISSUED,
        },
      ];

      const expected = generateFiltersArray(
        expectedFieldName,
        expectedFieldInputs,
        mockSubmittedFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('facilitiesTemplateFilters', () => {
    it('should return an object of all filters', () => {
      const result = facilitiesTemplateFilters();

      const expected = {
        type: typeFilters({}),
        submissionType: submissionTypeFilters({}),
        hasBeenIssued: hasBeenIssuedFilters({}),
      };

      expect(result).toEqual(expected);
    });
  });
});
