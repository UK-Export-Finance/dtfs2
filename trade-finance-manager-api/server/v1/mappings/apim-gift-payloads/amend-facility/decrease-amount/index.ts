import { APIM_GIFT_INTEGRATION } from '../../constants';
import { AmendmentPayloadDecreaseAmount, AmendmentAmountDataParams } from '../../types';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

/**
 * Generate a payload for a "decrease amount" amendment for a GIFT facility.
 * @param {AmendmentAmountDataParams} params - The amount and date for the decrease.
 * @param {number} params.amount - The amount to decrease the facility by.
 * @param {string} params.date - The date of the amendment in ISO format (YYYY-MM-DD).
 * @returns {AmendmentPayloadDecreaseAmount} The payload for the "decrease amount" amendment.
 */
export const decreaseAmount = ({ amount, date }: AmendmentAmountDataParams): AmendmentPayloadDecreaseAmount => ({
  amendmentType: AMENDMENT_TYPE.DECREASE_AMOUNT,
  amendmentData: {
    amount,
    date,
  },
});
