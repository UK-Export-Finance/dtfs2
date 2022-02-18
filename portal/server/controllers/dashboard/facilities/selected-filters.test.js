import {
  generateSelectedFiltersObject,
  generateSelectedFiltersObjectWithMappedValues,
  selectedSubmissionTypeFilters,
} from '../filters/generate-selected-filters';
import {
  mapIssuedValueToText,
  selectedHasBeenIssuedFilters,
  selectedFilters,
} from './selected-filters';
import CONTENT_STRINGS from '../../../content-strings';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/facilities - selected-filters', () => {
  describe('mapIssuedValueToText', () => {
    it(`should return ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED} when true string is passed`, () => {
      const mockValue = true;

      const result = mapIssuedValueToText(mockValue);

      const expected = CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED;
      expect(result).toEqual(expected);
    });

    it(`should return ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED} when false string is passed`, () => {
      const mockValue = false;

      const result = mapIssuedValueToText(mockValue);

      const expected = CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED;
      expect(result).toEqual(expected);
    });
  });

  describe('selectedHasBeenIssuedFilters', () => {
    it('should return result of generateSelectedFiltersObject with mapped hasBeenIssuedValues', () => {
      const mockHeading = CONTENT_STRINGS.DASHBOARD_FILTERS.FILTER_HEADINGS.FACILITY_STAGE;
      const mockFieldName = CONSTANTS.FIELD_NAMES.FACILITY.HAS_BEEN_ISSUED;
      const mockSubmittedFieldFilters = [
        'true',
        'false',
      ];

      const result = selectedHasBeenIssuedFilters(
        mockHeading,
        mockFieldName,
        mockSubmittedFieldFilters,
      );

      const mappedSubmittedFieldFilters = mockSubmittedFieldFilters.map((value) => ({
        value,
        mappedValue: mapIssuedValueToText(value),
      }));

      const expected = generateSelectedFiltersObjectWithMappedValues(
        mockHeading,
        mockFieldName,
        mappedSubmittedFieldFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('selectedFilters', () => {
    it('should return an array of objects for all selected/submitted filters', () => {
      const mockSubmittedFilters = {
        keyword: ['Testing'],
        type: [CONSTANTS.FACILITY_TYPE.BOND, CONSTANTS.FACILITY_TYPE.LOAN],
        'deal.submissionType': [CONSTANTS.SUBMISSION_TYPE.AIN],
        hasBeenIssued: ['true'],
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
        selectedHasBeenIssuedFilters(
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
