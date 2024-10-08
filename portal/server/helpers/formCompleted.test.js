import { isCompleted, validationErrorsCount } from './formCompleted';

describe('isCompleted', () => {
  const mockFields = {
    REQUIRED_FIELDS: ['fieldB', 'fieldC'],
    CONDITIONALLY_REQUIRED_FIELDS: ['fieldX'],
  };

  describe('validationErrorsCount', () => {
    it('should return the total of required errors in validationErrors.errorList, from the provided fields', () => {
      const mockValidationErrors = {
        errorList: {
          fieldA: { text: 'FieldA is required' },
          fieldB: { text: 'FieldB is required' },
          fieldC: { text: 'FieldC is required' },
          fieldD: { text: 'FieldD is required' },
        },
      };

      const result = validationErrorsCount(mockValidationErrors, mockFields);
      const expected = mockFields.REQUIRED_FIELDS.length;
      expect(result).toEqual(expected);
    });

    describe('when there is no validationErrors.errorList', () => {
      it('should return 0', () => {
        const result = validationErrorsCount({});
        expect(result).toEqual(0);
      });
    });
  });

  describe('isCompleted', () => {
    describe('when there are no errors returned by validationErrorsCount', () => {
      it('should return true', () => {
        const result = isCompleted({}, mockFields);
        expect(result).toEqual(true);
      });
    });

    describe('when there is at least 1 error returned by validationErrorsCount', () => {
      it('should return false', () => {
        const mockValidationErrors = {
          errorList: {
            fieldB: { text: 'FieldB is required' },
          },
        };

        const result = isCompleted(mockValidationErrors, mockFields);
        expect(result).toEqual(false);
      });
    });
  });
});
