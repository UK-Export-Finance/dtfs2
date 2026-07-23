import generateValidationErrors from './index';

describe('controllers/login/validation', () => {
  describe('generateValidationErrors', () => {
    it('should return null if no validation errors', () => {
      const formBody = { sixDigitAccessCode: '123456' };

      const result = generateValidationErrors(formBody);

      expect(result).toBeNull();
    });

    it('should return validation errors if sixDigitAccessCode is missing', () => {
      const formBody = {};

      const result = generateValidationErrors(formBody);

      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Enter access code',
          order: '1',
        },
      });
    });

    it('should return validation errors if sixDigitAccessCode is empty', () => {
      const formBody = { sixDigitAccessCode: '' };

      const result = generateValidationErrors(formBody);

      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Enter access code',
          order: '1',
        },
      });
    });

    it('should return validation errors if sixDigitAccessCode is whitespace', () => {
      const formBody = { sixDigitAccessCode: '   ' };

      const result = generateValidationErrors(formBody);

      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Enter access code',
          order: '1',
        },
      });
    });
  });
});
