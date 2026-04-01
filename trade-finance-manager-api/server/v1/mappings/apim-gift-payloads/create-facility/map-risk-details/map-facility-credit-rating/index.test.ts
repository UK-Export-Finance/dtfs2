import { mapFacilityCreditRating } from '.';

describe('mapFacilityCreditRating', () => {
  describe('when the exporter credit rating is in the TFM_CREDIT_RATING_MAP', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockCreditRiskRatings = ['BB-', 'B+'];
      const mockExporterCreditRating = 'Good (BB-)';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      const expected = 'BB-';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is in the list of credit risk ratings', () => {
    it('should return the mapped credit rating', () => {
      // Arrange
      const mockCreditRiskRatings = ['AAA', 'AA+', 'AA'];
      const mockExporterCreditRating = 'AAA';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      const expected = 'AAA';

      expect(result).toEqual(expected);
    });
  });

  describe('when the exporter credit rating is NOT in TFM_CREDIT_RATING_MAP or the list of credit risk ratings', () => {
    it('should return null', () => {
      // Arrange
      const mockCreditRiskRatings = ['AAA'];
      const mockExporterCreditRating = 'CCC';

      // Act
      const result = mapFacilityCreditRating(mockCreditRiskRatings, mockExporterCreditRating);

      // Assert
      expect(result).toBeNull();
    });
  });
});
