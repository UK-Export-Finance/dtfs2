import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftFacilityAmendmentPayload, MapAmountParams, TfmFacilityAmendmentData } from '../types';
import { getAmountAmendmentType } from './get-amount-amendment-type';
import { getAmendmentFields } from './get-amendment-fields';
import { getAmountDifference } from './get-amount-difference';

const {
  AMENDMENT_TYPE: { REPLACE_EXPIRY_DATE },
} = APIM_GIFT_INTEGRATION;

/**
 * Map an amendment amount to the amount adjusted by the covered percentage.
 * @param {MapAmountParams} params - The parameters for mapping the amount.
 * @param {number | null} params.coveredPercentage - The covered percentage to adjust the amount by.
 * @param {number} params.newAmount - The new amount after the amendment.
 * @param {number} params.previousAmount - The previous amount before the amendment.
 * @returns The calculated amount adjusted by the covered percentage.
 */
export const mapAmount = ({ coveredPercentage, newAmount, previousAmount }: MapAmountParams) => {
  const amountDifference = getAmountDifference(previousAmount, newAmount);

  // calculate newAmount adjusted by the covered percentage
  const amount = coveredPercentage ? amountDifference * (coveredPercentage / 100) : null;

  return amount;
};

/**
 * Builds an array of APIM/GIFT amendment payloads from TFM amendment data.
 * A single amendment can produce up to two payloads: one for an "amount" change and one for a "expiry date" change.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {ApimGiftFacilityAmendmentPayload[]} Array of APIM/GIFT payloads. Empty if no valid payload can be produced.
 */
export const amendFacility = (amendment: TfmFacilityAmendmentData): ApimGiftFacilityAmendmentPayload[] => {
  const { previousAmount, newAmount, coverEndDate, effectiveDate, coveredPercentage } = getAmendmentFields(amendment);

  const { changeFacilityValue, changeCoverEndDate } = amendment;

  const amount = mapAmount({ coveredPercentage, newAmount, previousAmount });

  const payloads: ApimGiftFacilityAmendmentPayload[] = [];

  if (changeFacilityValue) {
    const amountAmendmentType = getAmountAmendmentType({
      currentAmount: previousAmount,
      newAmount,
    });

    if (amountAmendmentType) {
      const payload = {
        amendmentType: amountAmendmentType,
        amendmentData: {
          amount,
          date: effectiveDate,
        },
      };

      payloads.push(payload);
    }
  }

  if (changeCoverEndDate) {
    payloads.push({
      amendmentType: REPLACE_EXPIRY_DATE,
      amendmentData: {
        expiryDate: coverEndDate,
      },
    });
  }

  return payloads;
};
