import { APIM_GIFT_INTEGRATION } from '../constants';
import { amendFacility } from '.';
import { TfmFacilityAmendmentData } from '../types';

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

describe('amendFacility', () => {
  it(`should map "${INCREASE_AMOUNT}" to APIM GIFT payload`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      changeFacilityValue: true,
      changeCoverEndDate: false,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = {
      amendmentType: INCREASE_AMOUNT,
      amendmentData: {
        amount: 30,
        date: '2024-01-01',
      },
    };

    expect(result).toEqual(expected);
  });

  it(`should map "${DECREASE_AMOUNT}" to APIM GIFT payload`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      changeFacilityValue: true,
      changeCoverEndDate: false,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = {
      amendmentType: DECREASE_AMOUNT,
      amendmentData: {
        amount: 30,
        date: '2024-01-01',
      },
    };

    expect(result).toEqual(expected);
  });

  it(`should map "${REPLACE_EXPIRY_DATE}" amendment to APIM GIFT payload`, () => {
    // Arrange
    const mockAmendment = {
      ...mockAmendmentBase,
      changeFacilityValue: false,
      changeCoverEndDate: true,
    };

    // Act
    const result = amendFacility(mockAmendment);

    // Assert
    const expected = {
      amendmentType: REPLACE_EXPIRY_DATE,
      amendmentData: {
        expiryDate: '2024-02-01',
      },
    };

    expect(result).toEqual(expected);
  });

  describe('when the amendment cannot be mapped to a valid APIM GIFT amendment type', () => {
    it('should return null', () => {
      // Arrange
      const mockAmendment = {
        ...mockAmendmentBase,
        changeFacilityValue: false,
        changeCoverEndDate: false,
      };

      // Act
      const result = amendFacility(mockAmendment);

      // Assert
      expect(result).toBeNull();
    });
  });
});
