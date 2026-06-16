import { APIM_GIFT_INTEGRATION } from '../../constants';
import { ApimGiftAmountAmendmentType } from '../../types';

type GetAmountAmendmentTypeParams = {
  currentAmount: number;
  newAmount: number;
};

/**
 * Resolves APIM/GIFT amendment type for an "amount change", by comparing current and new values.
 * @param {GetAmountAmendmentTypeParams} params - The parameters for determining the amount amendment type.
 * @param {number} params.currentAmount - The current facility amount.
 * @param {number} params.newAmount - The amended facility amount.
 * @returns {ApimGiftAmountAmendmentType | null} APIM/GIFT "amount" amendment type, or null if there is no change.
 */
export const getAmountAmendmentType = ({ currentAmount, newAmount }: GetAmountAmendmentTypeParams): ApimGiftAmountAmendmentType | null => {
  if (newAmount > currentAmount) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT;
  }

  if (newAmount < currentAmount) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT;
  }

  return null;
};
