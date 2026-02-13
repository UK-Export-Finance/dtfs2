import incorrectAccessCodeRule from './incorrect-access-code';

describe('controllers/login/validation/rules/incorrect-access-code', () => {
  describe('incorrectAccessCodeRule', () => {
    it('should return error for incorrect access code', () => {
      // Arrange
      const formBody = {};
      const errors = {};

      // Act
      const result = incorrectAccessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        signInOTP: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });
    });

    it('should override existing signInOTP error', () => {
      // Arrange
      const formBody = {};
      const errors = { signInOTP: { text: 'Some other error' } };

      // Act
      const result = incorrectAccessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        signInOTP: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });
    });

    it('should preserve other errors', () => {
      // Arrange
      const formBody = {};
      const errors = { otherField: { text: 'Some other error' } };

      // Act
      const result = incorrectAccessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        otherField: { text: 'Some other error' },
        signInOTP: {
          text: 'The access code you have entered is incorrect',
          order: '1',
        },
      });
    });
  });
});
