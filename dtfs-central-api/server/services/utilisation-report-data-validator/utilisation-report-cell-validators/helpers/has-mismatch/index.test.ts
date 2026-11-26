import { hasMismatch } from '.';

describe('services/utilisation-report-data-validator/utilisation-report-cell-validators/helpers/has-mismatch', () => {
  describe('when there is a mismatch in the field values', () => {
    it('should return true', () => {
      // Arrange
      const rows = [{ 'base currency': { value: 'GBP' } }, { 'base currency': { value: 'USD' } }];

      // Act
      const result = hasMismatch(rows, 'base currency');

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('when there is no mismatch in the field values', () => {
    it('should return false', () => {
      // Arrange
      const rows = [{ 'base currency': { value: 'GBP' } }, { 'base currency': { value: 'GBP' } }];

      // Act
      const result = hasMismatch(rows, 'base currency');

      // Assert
      expect(result).toBe(false);
    });
  });
});
