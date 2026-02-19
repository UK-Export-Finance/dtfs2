import accessCodeRule from './access-code';

describe('controllers/login/validation/rules/access-code', () => {
  describe('accessCodeRule', () => {
    it('should return an error if sixDigitAccessCode is missing', () => {
      // Arrange
      const formBody = {};
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is empty string', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '' };
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is only whitespace', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '   ' };
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Enter the access code',
          order: '1',
        },
      });
    });

    it('should not return an error if sixDigitAccessCode has a value', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '123456' };
      const errors = {};

      // Act
      const result = accessCodeRule(formBody, errors);

      // Assert
      expect(result).toEqual({});
    });

    it('should preserve existing errors', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '123456' };
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
