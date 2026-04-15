import { ACCRUAL_FREQUENCY_CODE_MAP, TFM_FEE_TYPES } from '../../../constants';
import { ApimGiftAccrualFrequencyCodeType } from '../../../types';

// TODO - if feeType is "At maturity", default to "Annually" and default date in GIFT to DTFS cover end date.

// The "At maturity" option in DTFS is very rare, reportedly only on EWCS facilities to date.
// If "At maturity" option is chosen in DTFS, default Interest frequency to "Annual" and default date in GIFT to DTFS cover end date

/**
 * Maps a TFM "frequency name" to its corresponding GIFT accrual frequency code.
 * @param frequencyName - The name of the frequency to map.
 * @returns {ApimGiftAccrualFrequencyCodeType | null} The corresponding accrual frequency code, or null if not found.
 */
export const mapFrequencyCode = (frequencyName: string): ApimGiftAccrualFrequencyCodeType | null => {
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
