import { getAmountDifference } from '.';

describe('getAmountDifference', () => {
  describe('when new amount is greater than previous amount', () => {
    it('should return the absolute difference', () => {
      // Arrange
      const previousAmount = 100;
      const newAmount = 130;

      // Act
      const result = getAmountDifference(previousAmount, newAmount);

      // Assert
      expect(result).toEqual(30);
    });
  });

  describe('when new amount is less than previous amount', () => {
    it('should return the absolute difference', () => {
      // Arrange
      const previousAmount = 130;
      const newAmount = 100;

      // Act
      const result = getAmountDifference(previousAmount, newAmount);

      // Assert
      expect(result).toEqual(30);
    });
  });

  describe('when both amounts are equal', () => {
    it('should return zero', () => {
      // Arrange
      const previousAmount = 100;
      const newAmount = 100;

      // Act
      const result = getAmountDifference(previousAmount, newAmount);

      // Assert
      expect(result).toEqual(0);
    });
  });

  describe('when amounts include negative values', () => {
    it('should return the absolute difference', () => {
      // Arrange
      const previousAmount = -10;
      const newAmount = 15;

      // Act
      const result = getAmountDifference(previousAmount, newAmount);

      // Assert
      expect(result).toEqual(25);
    });
  });
});
