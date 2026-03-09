import { mapApimCreditRiskRatings } from '.';

describe('mapApimCreditRiskRatings', () => {
  describe('when given a valid APIM MDM response', () => {
    it('should return an array of descriptions', () => {
      // Arrange
      const mockResponse = [
        { id: 1, description: 'AAA' },
        { id: 2, description: 'AA+' },
        { id: 3, description: 'AA' },
      ];

      // Act
      const result = mapApimCreditRiskRatings(mockResponse);

      // Assert
      const expected = ['AAA', 'AA+', 'AA'];

      expect(result).toEqual(expected);
    });
  });

  describe('when given a non-array response', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockResponse = {};

      // Act
      const result = mapApimCreditRiskRatings(mockResponse);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
