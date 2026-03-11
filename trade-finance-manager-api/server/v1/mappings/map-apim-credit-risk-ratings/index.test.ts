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

  describe('when a credit risk rating in the response is missing a description', () => {
    it('should return an array of descriptions, excluding any entries that are missing a description', () => {
      // Arrange
      const mockResponse = [{ id: 1, description: 'AAA' }, { id: 2 }, { id: 3, description: 'AA' }];

      // Act
      const result = mapApimCreditRiskRatings(mockResponse);

      // Assert
      const expected = ['AAA', 'AA'];

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
