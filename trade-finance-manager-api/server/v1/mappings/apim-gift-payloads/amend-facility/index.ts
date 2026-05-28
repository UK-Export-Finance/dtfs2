import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftFacilityAmendmentPayload, TfmFacilityAmendmentData } from '../types';
import { getAmendmentType } from './get-amendment-type';
import { getAmendmentFields } from './get-amendment-fields';
import { getAmountDifference } from './get-amount-difference';

/**
 * Builds an APIM/GIFT amendment payload from TFM amendment data.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {ApimGiftFacilityAmendmentPayload | null} APIM/GIFT payload for amount or expiry date amendments, or null if no valid payload can be produced.
 */
export const amendFacility = (amendment: TfmFacilityAmendmentData): ApimGiftFacilityAmendmentPayload | null => {
  const { previousAmount, newAmount, coverEndDate, effectiveDate } = getAmendmentFields(amendment);

  const amendmentType = getAmendmentType({ amendment, newAmount });

  if (amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT || amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT) {
    const amountDifference = getAmountDifference(previousAmount, newAmount);

    const payload = {
      amendmentType,
      amendmentData: {
        amount: amountDifference,
        date: effectiveDate,
      },
    };

    return payload;
  }

  if (amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.REPLACE_EXPIRY_DATE) {
    const payload = {
      amendmentType,
      amendmentData: {
        expiryDate: coverEndDate,
      },
    };

    return payload;
  }

  return null;
};
