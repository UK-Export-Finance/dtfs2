import accessCodeNumericRule from './access-code-numeric';

describe('controllers/login/validation/rules/access-code-numeric', () => {
  describe('accessCodeNumericRule', () => {
    it('should not return an error if sixDigitAccessCode is missing', () => {
      // Arrange
      const formBody = {};
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({});
    });

    it('should not return an error if sixDigitAccessCode is empty string', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({});
    });

    it('should not return an error if sixDigitAccessCode is only whitespace', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '   ' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({});
    });

    it('should not return an error if sixDigitAccessCode is exactly 6 digits', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '123456' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({});
    });

    it('should return an error if sixDigitAccessCode is exactly 6 characters but contains letters', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: 'abc123' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is exactly 6 characters but contains special characters', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '12345!' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is less than 6 characters', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '12345' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is more than 6 characters', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '1234567' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is less than 6 characters with letters', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '12abc' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });

    it('should return an error if sixDigitAccessCode is more than 6 characters with letters', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '1234567abc' };
      const errors = {};

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });

    it('should preserve existing errors', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: '123456' };
      const errors = { otherField: { text: 'Some other error' } };

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        otherField: { text: 'Some other error' },
      });
    });

    it('should add numeric error while preserving existing errors', () => {
      // Arrange
      const formBody = { sixDigitAccessCode: 'abc123' };
      const errors = { otherField: { text: 'Some other error' } };

      // Act
      const result = accessCodeNumericRule(formBody, errors);

      // Assert
      expect(result).toEqual({
        otherField: { text: 'Some other error' },
        sixDigitAccessCode: {
          text: 'Access code must be 6 numbers',
          order: '1',
        },
      });
    });
  });
});
