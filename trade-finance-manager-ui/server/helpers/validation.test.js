import { generateValidationErrors } from './validation';

describe('validation helper', () => {
  describe('generateValidationErrors', () => {
    it('should return errorList and summary from given params', () => {
      const result = generateValidationErrors('firstName', 'Enter first name', 1);

      expect(result).toEqual({
        count: 1,
        errorList: {
          firstName: {
            text: 'Enter first name',
            order: 1,
          },
        },
        summary: [
          {
            text: 'Enter first name',
            href: '#firstName',
          },
        ],
      });
    });

    it('should return errorList and summary with multiple errors, retaining order and count', () => {
      const firstNameErrors = generateValidationErrors('firstName', 'Enter first name', 1);

      const middleNameErrors = generateValidationErrors('middleName', 'Enter middle name', 2, firstNameErrors);

      const previousErrors = middleNameErrors;

      const result = generateValidationErrors('lastName', 'Enter last name', 3, previousErrors);

      expect(result).toEqual({
        count: 3,
        errorList: {
          firstName: {
            text: 'Enter first name',
            order: 1,
          },
          middleName: {
            text: 'Enter middle name',
            order: 2,
          },
          lastName: {
            text: 'Enter last name',
            order: 3,
          },
        },
        summary: [
          {
            text: 'Enter first name',
            href: '#firstName',
          },
          {
            text: 'Enter middle name',
            href: '#middleName',
          },
          {
            text: 'Enter last name',
            href: '#lastName',
          },
        ],
      });
    });
  });
});
