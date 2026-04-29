import { APIM_GIFT_INTEGRATION } from '../../constants';
import { AmendmentPayloadReplaceExpiryDate } from '../../types';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

type ReplaceExpiryDateParams = {
  expiryDate: string;
};

/**
 * Generate a payload for a "replace expiry date" amendment for a GIFT facility.
 * @param {ReplaceExpiryDateParams} params - The expiry date for the amendment.
 * @param {string} params.expiryDate - The new expiry date in ISO format (YYYY-MM-DD).
 * @returns {AmendmentPayloadReplaceExpiryDate} The payload for the "replace expiry date" amendment.
 */
export const replaceExpiryDate = ({ expiryDate }: ReplaceExpiryDateParams): AmendmentPayloadReplaceExpiryDate => ({
  amendmentType: AMENDMENT_TYPE.REPLACE_EXPIRY_DATE,
  amendmentData: {
    expiryDate,
  },
});
