import { generateValidationError } from './validation';

describe('validation - generateValidationError', () => {
  it('should return errorList and summary from given params', () => {
    const result = generateValidationError(
      'firstName',
      'Enter first name',
      1,
    );

    expect(result).toEqual({
      count: 1,
      errorList: {
        firstName: {
          text: 'Enter first name',
          order: 1,
        },
      },
      summary: [{
        text: 'Enter first name',
        href: '#firstName',
      }],
    });
  });
});
