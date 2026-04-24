import { mapSpreadRate } from '.';

describe('mapSpreadRate', () => {
  describe('when guaranteeFeePayableToUkef is provided', () => {
    it('should return the numeric value of guaranteeFeePayableToUkef without percentage sign', () => {
      // Arrange
      const guaranteeFeePayableToUkef = '1.23%';

      // Act
      const result = mapSpreadRate(guaranteeFeePayableToUkef);

      // Assert
      const expected = 1.23;

      expect(result).toEqual(expected);
    });
  });

  describe('when guaranteeFeePayableToUkef is provided as an empty string', () => {
    it('should return null', () => {
      // Act
      const result = mapSpreadRate('');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when guaranteeFeePayableToUkef is null', () => {
    it('should return null', () => {
      // Act
      const result = mapSpreadRate(null);

      // Assert
      expect(result).toBeNull();
    });
  });
});
