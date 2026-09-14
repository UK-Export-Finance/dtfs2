import { mapFacilityCreditRating } from '.';

describe('mapFacilityCreditRating', () => {
  describe('when the exporter credit rating is in the TFM_CREDIT_RATING_MAP', () => {
    it('should return the mapped credit rating for BB-', () => {
      // Arrange
      const mockExporterCreditRating = 'Good (BB-)';

      // Act
      const result = mapFacilityCreditRating(mockExporterCreditRating);

      // Assert
      const expected = 'BB-';

      expect(result).toEqual(expected);
    });

    it('should return the mapped credit rating for B+', () => {
      // Arrange
      const mockExporterCreditRating = 'Acceptable (B+)';

      // Act
      const result = mapFacilityCreditRating(mockExporterCreditRating);

      // Assert
      const expected = 'B+';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is another credit rating', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockExporterCreditRating = 'AAA';

      // Act
      const result = mapFacilityCreditRating(mockExporterCreditRating);

      // Assert
      const expected = 'AAA';

      expect(result).toEqual(expected);
    });
  });

  describe.each([
    { exporterCreditRating: undefined, description: 'undefined' },
    { exporterCreditRating: null, description: 'null' },
    { exporterCreditRating: '', description: 'empty string' },
  ])('when the exporter credit rating is $description', ({ exporterCreditRating }) => {
    it('should return null', () => {
      // Act
      const result = mapFacilityCreditRating(exporterCreditRating);

      // Assert
      expect(result).toBeNull();
    });
  });
});
