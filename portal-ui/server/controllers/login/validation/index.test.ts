import generateValidationErrors from './index';

describe('controllers/login/validation', () => {
  describe('generateValidationErrors', () => {
    it('should return null if no validation errors', () => {
      const formBody = { signInOTP: '123456' };

      const result = generateValidationErrors(formBody);

      expect(result).toBeNull();
    });

    it('should return validation errors if signInOTP is missing', () => {
      const formBody = {};

      const result = generateValidationErrors(formBody);

      expect(result).toEqual({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should return validation errors if signInOTP is empty', () => {
      const formBody = { signInOTP: '' };

      const result = generateValidationErrors(formBody);

      expect(result).toEqual({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should return validation errors if signInOTP is whitespace', () => {
      const formBody = { signInOTP: '   ' };

      const result = generateValidationErrors(formBody);

      expect(result).toEqual({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });
  });
});
