import { requiredFieldsArray, filterErrorList } from './pageFields';

describe('page fields', () => {
  describe('requiredFieldsArray', () => {
    it('should return REQUIRED_FIELDS and CONDITIONALLY_REQUIRED_FIELDS from given fields object', () => {
      const mockFields = {
        REQUIRED_FIELDS: ['a', 'b', 'c'],
        CONDITIONALLY_REQUIRED_FIELDS: ['d', 'e', 'f'],
      };

      const result = requiredFieldsArray(mockFields);
      const expected = [...mockFields.REQUIRED_FIELDS, ...mockFields.CONDITIONALLY_REQUIRED_FIELDS];
      expect(result).toEqual(expected);
    });
  });

  describe('filterErrorList', () => {
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
      const result = filterErrorList(mockValidationErrors.errorList, mockFields);
      const expected = {
        a: mockErrorList.a,
        b: mockErrorList.b,
      };
      expect(result).toEqual(expected);
    });

    describe('when there is no errorList passed', () => {
      it('should return empty object', () => {
        const result = filterErrorList(undefined, mockFields);
        expect(result).toEqual({});
      });
    });
  });
});
