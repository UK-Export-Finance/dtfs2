import { decimalsCount } from './decimals-count';

describe('decimalsCount', () => {
  describe('when there are decimals', () => {
    it('should return the amount of decimals when there is 1 decimal place', () => {
      // Arrange
      const value = 12.1;

      // Act
      const result = decimalsCount(value);

      // Assert
      expect(result).toEqual(1);
    });

    it('should return the amount of decimals when there are multiple decimal places', () => {
      // Arrange
      const value = 12.12345678;

      // Act
      const result = decimalsCount(value);

      // Assert
      expect(result).toEqual(8);
    });

    it('should return amount of decimals for a floating point number', () => {
      // Arrange
      const value = 0.30000000000000004;

      // Act
      const result = decimalsCount(value);

      // Assert
      expect(result).toEqual(17);
    });
  });

  describe('when there are no decimal places', () => {
    it('should return 0 when the number is 1', () => {
      // Arrange
      const value = 1;

      // Act
      const result = decimalsCount(value);

      // Assert
      expect(result).toEqual(0);
    });

    it('should return 0 when the number is 1000', () => {
      // Arrange
      const value = 1000;

      // Act
      const result = decimalsCount(value);

      // Assert
      expect(result).toEqual(0);
    });

    it('should return 0 when the number is 1000', () => {
      // Arrange
      const value = 1000.0;

      // Act
      const result = decimalsCount(value);

      // Assert
      expect(result).toEqual(0);
    });
  });
});
