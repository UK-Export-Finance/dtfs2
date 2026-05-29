import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftFacilityAmendmentPayload, TfmFacilityAmendmentData } from '../types';
import { getAmountAmendmentType } from './get-amount-amendment-type';
import { getAmendmentFields } from './get-amendment-fields';
import { getAmountDifference } from './get-amount-difference';

const {
  AMENDMENT_TYPE: { REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

/**
 * Builds an array of APIM/GIFT amendment payloads from TFM amendment data.
 * A single amendment can produce up to two payloads: one for an amount change and one for a cover end date change.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {ApimGiftFacilityAmendmentPayload[]} Array of APIM/GIFT payloads. Empty if no valid payload can be produced.
 */
export const amendFacility = (amendment: TfmFacilityAmendmentData): ApimGiftFacilityAmendmentPayload[] => {
  const { previousAmount, newAmount, coverEndDate, effectiveDate } = getAmendmentFields(amendment);
  const { changeFacilityValue, changeCoverEndDate } = amendment;

  const amountDifference = getAmountDifference(previousAmount, newAmount);

  const payloads: ApimGiftFacilityAmendmentPayload[] = [];

  if (changeFacilityValue) {
    const amountAmendmentType = getAmountAmendmentType({
      currentAmount: previousAmount,
      newAmount,
    });

    if (amountAmendmentType) {
      const payload = {
        amendmentType: amountAmendmentType,
        amendmentData: { amount: amountDifference, date: effectiveDate },
      };

      payloads.push(payload);
    }
  }

  if (changeCoverEndDate) {
    payloads.push({
      amendmentType: REPLACE_EXPIRY_DATE,
      amendmentData: { expiryDate: coverEndDate },
    });
  }

  return payloads;
};
