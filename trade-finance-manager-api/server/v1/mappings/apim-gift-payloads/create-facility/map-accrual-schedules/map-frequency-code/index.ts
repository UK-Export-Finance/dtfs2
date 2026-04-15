import { ACCRUAL_FREQUENCY_CODE_MAP, TFM_FEE_TYPES } from '../../../constants';
import { ApimGiftAccrualFrequencyCodeType } from '../../../types';

/**
 * Maps a TFM "frequency name" to its corresponding GIFT accrual frequency code.
 * If the feeType is "At maturity", defaults to "Annually".
 * Otherwise, maps based on the frequencyName value.
 * @param frequencyName - The name of the frequency to map.
 * @param feeType - Optional fee type, used to determine if the frequency should be overridden.
 * @returns {ApimGiftAccrualFrequencyCodeType | null} The corresponding accrual frequency code, or null if not found.
 */
export const mapFrequencyCode = (frequencyName: string, feeType?: string): ApimGiftAccrualFrequencyCodeType | null => {
  if (feeType === TFM_FEE_TYPES.AT_MATURITY) {
    return ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY;
  }

  switch (frequencyName) {
    case TFM_FEE_TYPES.MONTHLY:
      return ACCRUAL_FREQUENCY_CODE_MAP.MONTHLY;
    case TFM_FEE_TYPES.QUARTERLY:
      return ACCRUAL_FREQUENCY_CODE_MAP.QUARTERLY;
    case TFM_FEE_TYPES.SEMI_ANNUALLY:
      return ACCRUAL_FREQUENCY_CODE_MAP.SEMI_ANNUALLY;
    case TFM_FEE_TYPES.ANNUALLY:
      return ACCRUAL_FREQUENCY_CODE_MAP.ANNUALLY;
    case TFM_FEE_TYPES.EVERY_BUSINESS_DAY:
      return ACCRUAL_FREQUENCY_CODE_MAP.EVERY_BUSINESS_DAY;
    default:
      return null;
  }
};
