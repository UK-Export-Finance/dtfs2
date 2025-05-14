import { getFormattedMonetaryValue, getFormattedMonetaryValueWithoutDecimals, getMonetaryValueAsNumber } from './monetary-value';

describe('monetary value helpers', () => {
  describe('getFormattedMonetaryValue', () => {
    it('should format the given value as a string with thousands separated by comma', () => {
      // Arrange
      const value = 1234567.89;
      const expectedFormattedValue = '1,234,567.89';

      // Act
      const formattedValue = getFormattedMonetaryValue(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the value to 2 decimal places when the amount has more than 2 decimal places - rounding down', () => {
      // Arrange
      const value = 1234567.89423;
      const expectedFormattedValue = '1,234,567.89';

      // Act
      const formattedValue = getFormattedMonetaryValue(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the value to 2 decimal places when the amount has more than 2 decimal places - rounding up', () => {
      // Arrange
      const value = 1234567.8956766;
      const expectedFormattedValue = '1,234,567.90';

      // Act
      const formattedValue = getFormattedMonetaryValue(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the value to 2 decimal places when the amount has no decimal places', () => {
      // Arrange
      const value = 1234567;
      const expectedFormattedValue = '1,234,567.00';

      // Act
      const formattedValue = getFormattedMonetaryValue(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the number zero to 2 decimal places', () => {
      // Arrange
      const value = 0;
      const expectedFormattedValue = '0.00';

      // Act
      const formattedValue = getFormattedMonetaryValue(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });
  });

  describe('getFormattedMonetaryValueWithoutDecimals', () => {
    it('should format the given value as a string with thousands separated by comma', () => {
      // Arrange
      const value = 1234567;
      const expectedFormattedValue = '1,234,567';

      // Act
      const formattedValue = getFormattedMonetaryValueWithoutDecimals(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the given value as a string with thousands separated by comma rounded up when has decimal places', () => {
      // Arrange
      const value = 1234567.85;
      const expectedFormattedValue = '1,234,568';

      // Act
      const formattedValue = getFormattedMonetaryValueWithoutDecimals(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the given value as a string with thousands separated by comma rounded down when has decimal places under 0.5', () => {
      // Arrange
      const value = 1234567.41;
      const expectedFormattedValue = '1,234,567';

      // Act
      const formattedValue = getFormattedMonetaryValueWithoutDecimals(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the given value as a string without thousand seperators when under 1000', () => {
      // Arrange
      const value = 250;
      const expectedFormattedValue = '250';

      // Act
      const formattedValue = getFormattedMonetaryValueWithoutDecimals(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });

    it('should format the given value as a string without thousand seperators when 0', () => {
      // Arrange
      const value = 0;
      const expectedFormattedValue = '0';

      // Act
      const formattedValue = getFormattedMonetaryValueWithoutDecimals(value);

      // Assert
      expect(formattedValue).toEqual(expectedFormattedValue);
    });
  });

  describe('getMonetaryValueAsNumber', () => {
    it('should handle monetary string with commas', () => {
      // Arrange
      const value = '1,234,567.89';
      const expectedValue = 1234567.89;

      // Act
      const result = getMonetaryValueAsNumber(value);

      // Assert
      expect(result).toEqual(expectedValue);
    });

    it('should handle monetary string without commas', () => {
      // Arrange
      const value = '1234.56';
      const expectedValue = 1234.56;

      // Act
      const result = getMonetaryValueAsNumber(value);

      // Assert
      expect(result).toEqual(expectedValue);
    });

    it('should handle monetary string without decimal places', () => {
      // Arrange
      const value = '1,234,567';
      const expectedValue = 1234567;

      // Act
      const result = getMonetaryValueAsNumber(value);

      // Assert
      expect(result).toEqual(expectedValue);
    });

    it('should handle monetary string with zero value', () => {
      // Arrange
      const value = '0.00';
      const expectedValue = 0;

      // Act
      const result = getMonetaryValueAsNumber(value);

      // Assert
      expect(result).toEqual(expectedValue);
    });
  });
});
