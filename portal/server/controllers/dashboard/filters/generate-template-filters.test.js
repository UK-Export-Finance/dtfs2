import {
  generateFilterObject,
  generateFiltersArray,
  submissionTypeFilters,
} from './generate-template-filters';
import { formatFieldValue } from './helpers';
import CONSTANTS from '../../../constants';

describe('controllers/dashboard/filters - ui-filters', () => {
  describe('generateFilterObject', () => {
    const mockField = 'hasBeenIssued';
    const mockText = 'Issued';
    const mockValue = true;

    it('should return an object with mapped properties', () => {
      const mockSubmittedFilters = {};

      const result = generateFilterObject(
        mockField,
        mockText,
        mockValue,
        mockSubmittedFilters,
      );

      const expectedFormattedFieldValue = formatFieldValue(mockValue);

      const expectedLabelDataCy = `filter-label-${expectedFormattedFieldValue}`;
      const expectedValueDataCy = `filter-input-${expectedFormattedFieldValue}`;

      const expected = {
        label: {
          attributes: {
            'data-cy': expectedLabelDataCy,
          },
        },
        text: mockText,
        value: mockValue,
        checked: false,
        attributes: {
          'data-cy': expectedValueDataCy,
        },
      };

      expect(result).toEqual(expected);
    });

    describe('when submittedFilters has the provided field', () => {
      it('should return checked as true', () => {
        const mockSubmittedFilters = { [mockField]: [mockValue] };

        const result = generateFilterObject(
          mockField,
          mockText,
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
          mockText,
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
      const mockFieldInputs = [
        { text: CONSTANTS.PRODUCT.BSS_EWCS, value: CONSTANTS.PRODUCT.BSS_EWCS },
        { text: CONSTANTS.PRODUCT.GEF, value: CONSTANTS.PRODUCT.GEF },
      ];
      const mockSubmittedFilters = {};

      const result = generateFiltersArray(
        mockFieldName,
        mockFieldInputs,
        mockSubmittedFilters,
      );

      const expected = [
        generateFilterObject(
          mockFieldName,
          mockFieldInputs[0].text,
          mockFieldInputs[0].value,
          mockSubmittedFilters,
        ),
        generateFilterObject(
          mockFieldName,
          mockFieldInputs[1].text,
          mockFieldInputs[1].value,
          mockSubmittedFilters,
        ),
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('submissionTypeFilters', () => {
    it('should return generateFiltersArray with all possible `product` field inputs', () => {
      const mockSubmittedFilters = {};

      const expectedFieldName = `deal.${CONSTANTS.FIELD_NAMES.DEAL.SUBMISSION_TYPE}`;

      const result = submissionTypeFilters(
        expectedFieldName,
        mockSubmittedFilters,
      );

      const expectedFieldInputs = [
        { text: CONSTANTS.SUBMISSION_TYPE.AIN, value: CONSTANTS.SUBMISSION_TYPE.AIN },
        { text: CONSTANTS.SUBMISSION_TYPE.MIA, value: CONSTANTS.SUBMISSION_TYPE.MIA },
        { text: CONSTANTS.SUBMISSION_TYPE.MIN, value: CONSTANTS.SUBMISSION_TYPE.MIN },
      ];

      const expected = generateFiltersArray(
        expectedFieldName,
        expectedFieldInputs,
        mockSubmittedFilters,
      );

      expect(result).toEqual(expected);
    });
  });
});
