import { APIM_GIFT_INTEGRATION } from '../../constants';
import { getAmountAmendmentType } from '.';

const {
  AMENDMENT_TYPE: { DECREASE_AMOUNT, INCREASE_AMOUNT },
} = APIM_GIFT_INTEGRATION;

describe('getAmountAmendmentType', () => {
  describe('when new amount is greater than current amount', () => {
    it(`should return "${INCREASE_AMOUNT}"`, () => {
      // Arrange
      const params = {
        currentAmount: 100,
        newAmount: 130,
      };

      // Act
      const result = getAmountAmendmentType(params);

      // Assert
      expect(result).toEqual(INCREASE_AMOUNT);
    });
  });

  describe('when new amount is less than current amount', () => {
    it(`should return "${DECREASE_AMOUNT}"`, () => {
      // Arrange
      const params = {
        currentAmount: 130,
        newAmount: 100,
      };

      // Act
      const result = getAmountAmendmentType(params);

      // Assert
      expect(result).toEqual(DECREASE_AMOUNT);
    });
  });

  describe('when new amount equals the current amount', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        currentAmount: 100,
        newAmount: 100,
      };

      // Act
      const result = getAmountAmendmentType(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
