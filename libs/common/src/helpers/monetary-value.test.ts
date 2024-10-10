import { getFormattedMonetaryValue } from './monetary-value';

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
  });
});
