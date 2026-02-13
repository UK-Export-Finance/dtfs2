import accessCodeRule from './access-code';

describe('controllers/login/validation/rules/access-code', () => {
  describe('accessCodeRule', () => {
    it('should return an error if signInOTP is missing', () => {
      // Arrange
      const formBody = {};
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should return an error if signInOTP is empty string', () => {
      // Arrange
      const formBody = { signInOTP: '' };
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should return an error if signInOTP is only whitespace', () => {
      // Arrange
      const formBody = { signInOTP: '   ' };
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        signInOTP: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should not return an error if signInOTP has a value', () => {
      // Arrange
      const formBody = { signInOTP: '123456' };
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({});
    });

    it('should preserve existing errors', () => {
      // Arrange
      const formBody = { signInOTP: '123456' };
      const errors = { otherField: { text: 'Some other error' } };

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        otherField: { text: 'Some other error' },
      });
    });
  });
});
