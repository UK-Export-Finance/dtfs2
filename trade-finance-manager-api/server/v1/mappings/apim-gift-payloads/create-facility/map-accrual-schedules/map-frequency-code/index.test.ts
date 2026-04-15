import { ACCRUAL_FREQUENCY_CODE_MAP, TFM_FEE_TYPES } from '../../../constants';
import { mapFrequencyCode } from '.';

describe('mapFrequencyCode', () => {
  describe(`when frequencyName is ${TFM_FEE_TYPES.MONTHLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.MONTHLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_TYPES.MONTHLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.MONTHLY;

      expect(result).toBe(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_TYPES.QUARTERLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.QUARTERLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_TYPES.QUARTERLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.QUARTERLY;

      expect(result).toBe(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_TYPES.SEMI_ANNUALLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.SEMI_ANNUALLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_TYPES.SEMI_ANNUALLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.SEMI_ANNUALLY;

      expect(result).toBe(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_TYPES.ANNUALLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_TYPES.ANNUALLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY;

      expect(result).toBe(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_TYPES.EVERY_BUSINESS_DAY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.EVERY_BUSINESS_DAY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_TYPES.EVERY_BUSINESS_DAY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.EVERY_BUSINESS_DAY;

      expect(result).toBe(expected);
    });
  });

  describe('when frequencyName is not recognised', () => {
    it('should return null', () => {
      // Act
      const result = mapFrequencyCode('Unrecognised');

      // Assert
      expect(result).toBeNull();
    });
  });
});
