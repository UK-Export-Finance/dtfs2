import { APIM_GIFT_INTEGRATION } from '../../constants';
import { TfmFacilityAmendmentData } from '../../types';
import { getAmountAmendmentType, getAmendmentType } from '.';

const {
  AMENDMENT_TYPE: { DECREASE_AMOUNT, INCREASE_AMOUNT, REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

const mockAmendmentBase: TfmFacilityAmendmentData = {
  currentValue: 100,
  value: 130,
  effectiveDate: '1704067200',
  tfm: {
    coverEndDate: 1706745600000,
  },
};

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

describe('getAmendmentType', () => {
  describe('when changeCoverEndDate is true', () => {
    it(`should return "${REPLACE_EXPIRY_DATE}"`, () => {
      // Arrange
      const params = {
        amendment: {
          ...mockAmendmentBase,
          changeCoverEndDate: true,
          changeFacilityValue: false,
        },
        newAmount: 130,
      };

      // Act
      const result = getAmendmentType(params);

      // Assert
      expect(result).toEqual(REPLACE_EXPIRY_DATE);
    });
  });

  describe('when changeFacilityValue is true and amendment.currentValue is defined', () => {
    it(`should return "${INCREASE_AMOUNT}"`, () => {
      // Arrange
      const params = {
        amendment: {
          ...mockAmendmentBase,
          changeCoverEndDate: false,
          changeFacilityValue: true,
        },
        newAmount: 130,
      };

      // Act
      const result = getAmendmentType(params);

      // Assert
      expect(result).toEqual(INCREASE_AMOUNT);
    });
  });

  describe('when changeFacilityValue is true and amendment.currentValue is NOT defined', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        amendment: {
          ...mockAmendmentBase,
          changeCoverEndDate: false,
          changeFacilityValue: true,
          currentValue: undefined,
        },
        newAmount: 130,
      };

      // Act
      const result = getAmendmentType(params);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when the amendment cannot be mapped', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        amendment: {
          ...mockAmendmentBase,
          changeCoverEndDate: false,
          changeFacilityValue: false,
        },
        newAmount: 130,
      };

      // Act
      const result = getAmendmentType(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
