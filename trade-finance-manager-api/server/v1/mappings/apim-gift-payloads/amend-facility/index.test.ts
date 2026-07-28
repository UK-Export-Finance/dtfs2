import { APIM_GIFT_INTEGRATION } from '../constants';
import { amendFacility, mapAmount } from '.';
import { TfmFacilityAmendmentData } from '../types';

const {
  AMENDMENT_TYPE: { DECREASE_AMOUNT, INCREASE_AMOUNT, REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

const mockAmendmentBase: TfmFacilityAmendmentData = {
  currentValue: 100,
  value: 130,
  effectiveDate: 1704067200,
  coverEndDate: 1706745600000,
  tfm: {},
};

describe('mapAmount', () => {
  describe('when coveredPercentage is provided', () => {
    it('should return the amount difference adjusted by 80% covered percentage', () => {
      // Arrange
      const params = {
        coveredPercentage: 80,
        newAmount: 150,
        previousAmount: 100,
      };

      // Act
      const result = mapAmount(params);

      // Assert
      // amountDifference = 150 - 100 = 50
      // amount = 50 * (80 / 100) = 40
      expect(result).toEqual(40);
    });

    it('should return the amount difference adjusted by 100% covered percentage', () => {
      // Arrange
      const params = {
        coveredPercentage: 100,
        newAmount: 200,
        previousAmount: 100,
      };

      // Act
      const result = mapAmount(params);

      // Assert
      // amountDifference = 200 - 100 = 100
      // amount = 100 * (100 / 100) = 100
      expect(result).toEqual(100);
    });

    it('should return the amount difference adjusted by 50% covered percentage', () => {
      // Arrange
      const params = {
        coveredPercentage: 50,
        newAmount: 250,
        previousAmount: 100,
      };

      // Act
      const result = mapAmount(params);

      // Assert
      // amountDifference = 250 - 100 = 150
      // amount = 150 * (50 / 100) = 75
      expect(result).toEqual(75);
    });

    it('should handle decrease amount scenario with covered percentage', () => {
      // Arrange
      const params = {
        coveredPercentage: 80,
        newAmount: 60,
        previousAmount: 100,
      };

      // Act
      const result = mapAmount(params);

      // Assert
      // amountDifference = 60 - 100 = -40
      // amount = -40 * (80 / 100) = -32
      expect(result).toEqual(-32);
    });
  });

  describe('when coveredPercentage is null', () => {
    it('should return null', () => {
      // Arrange
      const params = {
        coveredPercentage: null,
        newAmount: 150,
        previousAmount: 100,
      };

      // Act
      const result = mapAmount(params);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('when coveredPercentage is 0', () => {
    it('should return null (falsy check)', () => {
      // Arrange
      const params = {
        coveredPercentage: 0,
        newAmount: 150,
        previousAmount: 100,
      };

      // Act
      const result = mapAmount(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});

describe('amendFacility', () => {
  it(`should return an array containing an "${INCREASE_AMOUNT}" payload`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      changeFacilityValue: true,
      changeCoverEndDate: false,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = [
      {
        amendmentType: INCREASE_AMOUNT,
        amendmentData: {
          amount: null,
          date: '2024-01-01',
        },
      },
    ];

    expect(result).toEqual(expected);
  });

  it(`should return an array containing a "${DECREASE_AMOUNT}" payload`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      value: 70,
      changeFacilityValue: true,
      changeCoverEndDate: false,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = [
      {
        amendmentType: DECREASE_AMOUNT,
        amendmentData: {
          amount: null,
          date: '2024-01-01',
        },
      },
    ];

    expect(result).toEqual(expected);
  });

  it(`should return an array containing a "${REPLACE_EXPIRY_DATE}" payload`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      changeFacilityValue: false,
      changeCoverEndDate: true,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = [
      {
        amendmentType: REPLACE_EXPIRY_DATE,
        amendmentData: {
          expiryDate: '2024-02-01',
        },
      },
    ];

    expect(result).toEqual(expected);
  });

  it(`should return an array containing both an amount payload and a "${REPLACE_EXPIRY_DATE}" payload when both flags are set`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      changeFacilityValue: true,
      changeCoverEndDate: true,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = [
      {
        amendmentType: INCREASE_AMOUNT,
        amendmentData: {
          amount: null,
          date: '2024-01-01',
        },
      },
      {
        amendmentType: REPLACE_EXPIRY_DATE,
        amendmentData: {
          expiryDate: '2024-02-01',
        },
      },
    ];

    expect(result).toEqual(expected);
  });

  describe('when coveredPercentage is not provided', () => {
    it(`should adjust the amount difference`, () => {
      // Arrange
      const mockAmendment = {
        ...mockAmendmentBase,
        value: 150,
        coveredPercentage: 80,
        changeFacilityValue: true,
        changeCoverEndDate: false,
      };

      // Act
      const result = amendFacility(mockAmendment);

      // Assert
      const expected = [
        {
          amendmentType: INCREASE_AMOUNT,
          amendmentData: {
            amount: 40,
            date: '2024-01-01',
          },
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when coveredPercentage is null', () => {
    it(`should return null amount`, () => {
      // Arrange
      const mockAmendment = {
        ...mockAmendmentBase,
        value: 150,
        coveredPercentage: null,
        changeFacilityValue: true,
        changeCoverEndDate: false,
      };

      // Act
      const result = amendFacility(mockAmendment);

      // Assert
      const expected = [
        {
          amendmentType: INCREASE_AMOUNT,
          amendmentData: {
            amount: null,
            date: '2024-01-01',
          },
        },
      ];

      expect(result).toEqual(expected);
    });
  });

  describe('when the amendment cannot be mapped to any valid APIM GIFT amendment type', () => {
    it('should return an empty array', () => {
      // Arrange
      const mockAmendment = {
        ...mockAmendmentBase,
        changeFacilityValue: false,
        changeCoverEndDate: false,
      };

      // Act
      const result = amendFacility(mockAmendment);

      // Assert
      expect(result).toEqual([]);
    });
  });
});
