import {
  generateFilterObject,
  generateFiltersArray,
  productFilters,
  submissionTypeFilters,
  statusFilters,
  dashboardFilters,
} from './ui-filters';
import {
  FIELD_NAMES,
  PRODUCT,
  SUBMISSION_TYPE,
  STATUS,
} from '../../../constants';
import CONTENT_STRINGS from '../../../content-strings';

describe('controllers/dashboard/filters - ui-filters', () => {
  describe('generateFilterObject', () => {
    const mockField = 'dealType';
    const mockValue = 'GEF';

    it('should return an object with mapped properties', () => {
      const mockSubmittedFilters = {};

      const result = generateFilterObject(
        mockField,
        mockValue,
        mockSubmittedFilters,
      );

      const expected = {
        text: mockValue,
        value: mockValue,
        checked: false,
      };

      expect(result).toEqual(expected);
    });

    describe('when submittedFilters has the provided field', () => {
      it('should return checked as true', () => {
        const mockSubmittedFilters = { [mockField]: [mockValue] };

        const result = generateFilterObject(
          mockField,
          mockValue,
          mockSubmittedFilters,
        );

        expect(result.checked).toEqual(true);
      });
    });

    describe('when submittedFilters has the provided field but not the value', () => {
      it('should return checked as false', () => {
        const mockSubmittedFilters = { [mockField]: ['different value'] };

        const result = generateFilterObject(
          mockField,
          mockValue,
          mockSubmittedFilters,
        );

        expect(result.checked).toEqual(false);
      });
    });
  });

  describe('generateFiltersArray', () => {
    it('should return an array of filter objects', () => {
      const mockFieldName = 'dealType';
      const mockFieldValues = ['GEF', 'BSS/EWCS'];
      const mockSubmittedFilters = {};

      const result = generateFiltersArray(
        mockFieldName,
        mockFieldValues,
        mockSubmittedFilters,
      );

      const expected = [
        generateFilterObject(mockFieldName, mockFieldValues[0], mockSubmittedFilters),
        generateFilterObject(mockFieldName, mockFieldValues[1], mockSubmittedFilters),
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('productFilters', () => {
    it('should return generateFiltersArray with all possible `product` field values', () => {
      const mockSubmittedFilters = {};

      const result = productFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.DEAL.DEAL_TYPE;

      const expectedFieldValues = [
        PRODUCT.BSS_EWCS,
        PRODUCT.GEF,
      ];

      const expected = generateFiltersArray(
        expectedFieldName,
        expectedFieldValues,
        mockSubmittedFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('submissionTypeFilters', () => {
    it('should return generateFiltersArray with all possible `product` field values', () => {
      const mockSubmittedFilters = {};

      const result = submissionTypeFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.DEAL.SUBMISSION_TYPE;

      const expectedFieldValues = [
        SUBMISSION_TYPE.AIN,
        SUBMISSION_TYPE.MIA,
        SUBMISSION_TYPE.MIN,
      ];

      const expected = generateFiltersArray(
        expectedFieldName,
        expectedFieldValues,
        mockSubmittedFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('statusFilters', () => {
    it('should return generateFiltersArray with all possible `product` field values', () => {
      const mockSubmittedFilters = {};

      const result = statusFilters(mockSubmittedFilters);

      const expectedFieldName = FIELD_NAMES.DEAL.STATUS;

      const expectedFieldValues = [
        CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES,
        STATUS.DRAFT,
        STATUS.READY_FOR_APPROVAL,
        STATUS.INPUT_REQUIRED,
        STATUS.SUBMITTED,
        STATUS.SUBMISSION_ACKNOWLEDGED,
        STATUS.IN_PROGRESS_BY_UKEF,
        STATUS.APPROVED_WITH_CONDITIONS,
        STATUS.APPROVED,
        STATUS.REFUSED,
        STATUS.ABANDONED,
      ];

      const expected = generateFiltersArray(
        expectedFieldName,
        expectedFieldValues,
        mockSubmittedFilters,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('dashboardFilters', () => {
    it('should return an object of all filters', () => {
      const result = dashboardFilters();

      const expected = {
        product: productFilters({}),
        submissionType: submissionTypeFilters({}),
        status: statusFilters({}),
      };

      expect(result).toEqual(expected);
    });
  });
});
