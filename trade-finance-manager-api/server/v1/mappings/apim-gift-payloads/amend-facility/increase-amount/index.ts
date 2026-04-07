import { APIM_GIFT_INTEGRATION } from '../../constants';
import { AmendmentPayloadIncreaseAmount, AmendmentAmountDataParams } from '../../types';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

/**
 * Generate a payload for an "increase amount" amendment for a GIFT facility.
 * @param {AmendmentAmountDataParams} params - The amount and date for the increase.
 * @param {number} params.amount - The amount to increase the facility by.
 * @param {string} params.date - The date of the amendment in ISO format (YYYY-MM-DD).
 * @returns {AmendmentPayloadIncreaseAmount} The payload for the "increase amount" amendment.
 */
export const increaseAmount = ({ amount, date }: AmendmentAmountDataParams): AmendmentPayloadIncreaseAmount => ({
  amendmentType: AMENDMENT_TYPE.INCREASE_AMOUNT,
  amendmentData: {
    amount,
    date,
  },
});
