import {
  allRequiredFieldsArray,
  getFieldErrors,
} from './pageFields';
import FIELDS from '../routes/contract/pageFields/bond';

describe('page specific validation errors', () => {
  describe('allRequiredFieldsArray', () => {
    it('should return REQUIRED_FIELDS and CONDITIONALLY_REQUIRED_FIELDS from given fields object', () => {
      const mockFields = {
        REQUIRED_FIELDS: ['a', 'b', 'c'],
        CONDITIONALLY_REQUIRED_FIELDS: ['d', 'e', 'f'],
      };

      const result = allRequiredFieldsArray(mockFields);
      const expected = [
        ...mockFields.REQUIRED_FIELDS,
        ...mockFields.CONDITIONALLY_REQUIRED_FIELDS,
      ];
      expect(result).toEqual(expected);
    });
  });

  describe('getFieldErrors', () => {
    const mockFields = ['a', 'b', 'c'];

    it('should only return validationErrors that are in the fields object', () => {
      const mockBondErrors = {
        someField: { order: '1', text: 'Field is required' },
        otherField: { order: '2', text: 'Field is required' },
      };

      const mockErrorList = {
        ...mockBondErrors,
        a: { order: '4', text: 'Field is required' },
        b: { order: '4', text: 'Field is required' },
      };

      const mockValidationErrors = {
        errorList: mockErrorList,
        count: mockErrorList.length,
      };
      const result = getFieldErrors(mockValidationErrors, mockFields);
      const expected = {
        a: mockErrorList.a,
        b: mockErrorList.b,
      };
      expect(result).toEqual(expected);
    });

    it('should return empty object when there are no validationErrors', () => {
      const result = getFieldErrors(
        {},
        mockFields,
      );
      expect(result).toEqual({});
    });
  });
});
