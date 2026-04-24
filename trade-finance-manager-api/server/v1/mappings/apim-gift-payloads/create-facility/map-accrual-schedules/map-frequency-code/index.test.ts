import { ACCRUAL_FREQUENCY_CODE_MAP, TFM_FEE_FREQUENCIES } from '../../../constants';
import { mapFrequencyCode } from '.';

describe('mapFrequencyCode', () => {
  describe(`when feeType is ${TFM_FEE_FREQUENCIES.AT_MATURITY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_FREQUENCIES.MONTHLY, TFM_FEE_FREQUENCIES.AT_MATURITY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY;

      expect(result).toEqual(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_FREQUENCIES.MONTHLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.MONTHLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_FREQUENCIES.MONTHLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.MONTHLY;

      expect(result).toEqual(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_FREQUENCIES.QUARTERLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.QUARTERLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_FREQUENCIES.QUARTERLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.QUARTERLY;

      expect(result).toEqual(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_FREQUENCIES.SEMI_ANNUALLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.SEMI_ANNUALLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_FREQUENCIES.SEMI_ANNUALLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.SEMI_ANNUALLY;

      expect(result).toEqual(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_FREQUENCIES.ANNUALLY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_FREQUENCIES.ANNUALLY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY;

      expect(result).toEqual(expected);
    });
  });

  describe(`when frequencyName is ${TFM_FEE_FREQUENCIES.EVERY_BUSINESS_DAY}`, () => {
    it(`should return ${ACCRUAL_FREQUENCY_CODE_MAP.EVERY_BUSINESS_DAY}`, () => {
      // Act
      const result = mapFrequencyCode(TFM_FEE_FREQUENCIES.EVERY_BUSINESS_DAY);

      // Assert
      const expected = ACCRUAL_FREQUENCY_CODE_MAP.EVERY_BUSINESS_DAY;

      expect(result).toEqual(expected);
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
