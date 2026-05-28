import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftAmendmentType, TfmFacilityAmendmentData } from '../../types';

type GetAmountAmendmentTypeParams = {
  currentAmount: number;
  newAmount: number;
};

/**
 * Resolves APIM/GIFT amendment type for an "amount change", by comparing current and new values.
 * @param {GetAmountAmendmentTypeParams} params - The parameters for determining the amount amendment type.
 * @param {number} params.currentAmount - The current facility amount.
 * @param {number} params.newAmount - The amended facility amount.
 * @returns {ApimGiftAmendmentType | null} APIM/GIFT "amount" amendment type, or null if there is no change.
 */
export const getAmountAmendmentType = ({ currentAmount, newAmount }: GetAmountAmendmentTypeParams): ApimGiftAmendmentType | null => {
  if (newAmount > currentAmount) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT;
  }

  if (newAmount < currentAmount) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT;
  }

  return null;
};

type GetAmendmentTypeParams = {
  amendment: TfmFacilityAmendmentData;
  newAmount: number;
};

/**
 * Resolves the APIM/GIFT amendment type from TFM amendment flags and values.
 * @param {GetAmendmentTypeParams} params - The parameters for determining the amendment type.
 * @param {TfmFacilityAmendmentData} params.amendment - The facility amendment data from TFM.
 * @param {number} params.newAmount - The amended amount extracted from amendment data.
 * @returns {ApimGiftAmendmentType | null} The APIM/GIFT amendment type, or null when the amendment cannot be mapped.
 */
export const getAmendmentType = ({ amendment, newAmount }: GetAmendmentTypeParams): ApimGiftAmendmentType | null => {
  const { changeCoverEndDate, changeFacilityValue, currentValue: currentAmount } = amendment;

  if (changeCoverEndDate && changeFacilityValue) {
    throw new Error('Unsupported APIM/GIFT amendment mapping: cover end date and facility value cannot be mapped as a single amendment type.');
  }

  if (changeCoverEndDate) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.REPLACE_EXPIRY_DATE;
  }

  if (changeFacilityValue && currentAmount) {
    return getAmountAmendmentType({
      currentAmount,
      newAmount,
    });
  }

  return null;
};
