import { APIM_GIFT_INTEGRATION } from '../../../mappings/apim-gift-payloads/constants';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import apiModule from '../../../api';
import { ApimGiftFacilityAmendmentPayload, ApiTypes } from '../../../mappings/apim-gift-payloads/types';

type ApimGiftAmendmentType = (typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE)[keyof typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE];

type ApimGiftFacilityAmendment = {
  changeFacilityValue?: boolean;
  changeCoverEndDate?: boolean;
  value?: number;
  currentValue?: number;
  effectiveDate?: string;
  coverEndDate?: string;
  ukefDecision?: {
    value?: number;
    coverEndDate?: string;
    effectiveDate?: string;
  };
};

export const getAmendmentFields = (amendment: ApimGiftFacilityAmendment) => {
  const amount = amendment.ukefDecision?.value ?? amendment.value;
  const coverEndDate = amendment.ukefDecision?.coverEndDate ?? amendment.coverEndDate;
  const effectiveDate = Number(amendment.ukefDecision?.effectiveDate ?? amendment.effectiveDate);

  return {
    amount,
    coverEndDate,
    effectiveDate,
  };
};

export const getAmountAmendmentType = (amendment: ApimGiftFacilityAmendment, amount: number): ApimGiftAmendmentType | null => {
  if (!amendment.changeFacilityValue) {
    return null;
  }

  const originalValue = amendment.currentValue;

  if (typeof amount !== 'number' || typeof originalValue !== 'number') {
    return null;
  }

  if (amount > originalValue) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT;
  }

  if (amount < originalValue) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT;
  }

  return null;
};

export const getAmendmentType = (amendment: ApimGiftFacilityAmendment, amount?: number): ApimGiftAmendmentType | null => {
  if (amount) {
    return getAmountAmendmentType(amendment, amount);
  }

  return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.REPLACE_EXPIRY_DATE;
};

export const buildAmendmentPayload = (amendment: ApimGiftFacilityAmendment): ApimGiftFacilityAmendmentPayload | null => {
  const { amount, effectiveDate } = getAmendmentFields(amendment);

  const amendmentType = getAmendmentType(amendment, amount);

  if (!amendmentType) {
    return null;
  }

  if (amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT || amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT) {
    if (typeof amount !== 'number' || !effectiveDate) {
      return null;
    }

    return APIM_GIFT_PAYLOADS.amendFacility[amendmentType]({
      amount,
      date: new Date(effectiveDate * 1000).toISOString().slice(0, 10),
    });
  }

  if (!effectiveDate) {
    return null;
  }

  return APIM_GIFT_PAYLOADS.amendFacility[amendmentType]({
    // TODO: helper
    expiryDate: new Date(effectiveDate * 1000).toISOString().slice(0, 10),
  });
};

// TODO:
// use these to determine amendment type amendment.changeFacilityValue || amendment.changeCoverEndDate

type TempType = {
  amendment: ApimGiftFacilityAmendment;
  ukefFacilityId: string;
};

export const submitFacilityAmendmentsToApimGift = async ({ amendment, ukefFacilityId }: TempType) => {
  const api = apiModule as ApiTypes;

  const payload = buildAmendmentPayload(amendment);

  // @ts-ignore
  await api.amendGiftFacility(payload, ukefFacilityId);
};
