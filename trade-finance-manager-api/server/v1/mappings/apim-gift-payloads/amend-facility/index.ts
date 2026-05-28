import { getFormattedUTCDateString } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../constants';
import { ApimGiftAmendmentType, ApimGiftFacilityAmendmentPayload, TfmFacilityAmendmentData } from '../types';

type AmendmentFields = {
  amount: number;
  coverEndDate: string;
  effectiveDate: string;
};

/**
 * Extracts amendment values from TFM amendment data.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {AmendmentFields} An object containing amount, cover end date and effective date values for APIM/GIFT payload construction.
 */
export const getAmendmentFields = (amendment: TfmFacilityAmendmentData): AmendmentFields => {
  const amount = Number(amendment.value);
  const coverEndDate = getFormattedUTCDateString(Number(amendment?.tfm?.coverEndDate));
  const effectiveDate = getFormattedUTCDateString(Number(amendment.effectiveDate));

  return {
    amount,
    coverEndDate,
    effectiveDate,
  };
};

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
  amount: number;
};

/**
 * Resolves the APIM/GIFT amendment type from TFM amendment flags and values.
 * @param {GetAmendmentTypeParams} params - The parameters for determining the amendment type.
 * @param {TfmFacilityAmendmentData} params.amendment - The facility amendment data from TFM.
 * @param {number} params.amount - The amended amount extracted from amendment data.
 * @returns {ApimGiftAmendmentType | null} The APIM/GIFT amendment type, or null when the amendment cannot be mapped.
 */
export const getAmendmentType = ({ amendment, amount }: GetAmendmentTypeParams): ApimGiftAmendmentType | null => {
  const { changeCoverEndDate, changeFacilityValue } = amendment;

  if (changeCoverEndDate) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.REPLACE_EXPIRY_DATE;
  }

  if (changeFacilityValue && typeof amendment.currentValue === 'number') {
    const { currentValue } = amendment;

    return getAmountAmendmentType({
      currentAmount: currentValue,
      newAmount: amount,
    });
  }

  return null;
};

const getAmountDifference = (previousAmount: number, newAmount: number): number => {
  return Math.abs(previousAmount - newAmount);
};

/**
 * Builds an APIM/GIFT amendment payload from TFM amendment data.
 * @param {TfmFacilityAmendmentData} amendment - The facility amendment data from TFM.
 * @returns {ApimGiftFacilityAmendmentPayload | null} APIM/GIFT payload for amount or expiry date amendments, or null if no valid payload can be produced.
 */
export const amendFacility = (amendment: TfmFacilityAmendmentData): ApimGiftFacilityAmendmentPayload | null => {
  const { amount, coverEndDate, effectiveDate } = getAmendmentFields(amendment);

  const amendmentType = getAmendmentType({ amendment, amount });

  if (amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT || amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT) {
    const amountDifference = getAmountDifference(Number(amendment.currentValue), amount);

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
