import { getFormattedUTCDateString } from '@ukef/dtfs2-common';
import { APIM_GIFT_INTEGRATION } from '../../../mappings/apim-gift-payloads/constants';
import { APIM_GIFT_PAYLOADS } from '../../../mappings/apim-gift-payloads';
import apiModule from '../../../api';
import { ApimGiftFacilityAmendmentPayload } from '../../../mappings/apim-gift-payloads/types';

type ApimGiftAmendmentType = (typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE)[keyof typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE];

// TODO: this is not APIM/GIFT, this is input/structure from TFM
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
  const amount = Number(amendment.ukefDecision?.value);
  const coverEndDate = amendment.ukefDecision?.coverEndDate ?? amendment.coverEndDate;
  const effectiveDate = Number(amendment.ukefDecision?.effectiveDate ?? amendment.effectiveDate);

  return {
    amount,
    coverEndDate,
    effectiveDate,
  };
};

export const getAmountAmendmentType = (currentAmount: number, newAmount: number): ApimGiftAmendmentType | null => {
  if (newAmount > currentAmount) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT;
  }

  if (newAmount < currentAmount) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT;
  }

  return null;
};

export const getAmendmentType = (amendment: ApimGiftFacilityAmendment, amount: number): ApimGiftAmendmentType | null => {
  const { changeCoverEndDate, changeFacilityValue } = amendment;

  if (changeCoverEndDate) {
    return APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.REPLACE_EXPIRY_DATE;
  }

  if (changeFacilityValue) {
    return getAmountAmendmentType(amendment.currentValue ?? 0, Number(amount));
  }

  return null;
};

export const buildAmendmentPayload = (amendment: ApimGiftFacilityAmendment): ApimGiftFacilityAmendmentPayload | null => {
  const { amount, effectiveDate } = getAmendmentFields(amendment);

  const amendmentType = getAmendmentType(amendment, amount);

  if (!amendmentType || !effectiveDate) {
    return null;
  }

  if (amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT || amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT) {
    if (typeof amount !== 'number') {
      return null;
    }

    return APIM_GIFT_PAYLOADS.amendFacility[amendmentType]({
      amount,
      date: getFormattedUTCDateString(effectiveDate),
    });
  }

  if (amendmentType === APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.REPLACE_EXPIRY_DATE) {
    return APIM_GIFT_PAYLOADS.amendFacility[amendmentType]({
      expiryDate: getFormattedUTCDateString(effectiveDate),
    });
  }

  return null;
};

// TODO:
// use these to determine amendment type amendment.changeFacilityValue || amendment.changeCoverEndDate

type TempType = {
  amendment: ApimGiftFacilityAmendment;
  ukefFacilityId: string;
};

type GiftAmendFacilityResponse = object | false;

type GiftAmendApi = {
  amendGiftFacility: (facilityAmendmentData: ApimGiftFacilityAmendmentPayload, facilityId: string) => Promise<GiftAmendFacilityResponse>;
};

const hasGiftAmendApi = (value: unknown): value is GiftAmendApi => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return typeof (value as { amendGiftFacility?: unknown }).amendGiftFacility === 'function';
};

export const submitFacilityAmendmentsToApimGift = async ({ amendment, ukefFacilityId }: TempType): Promise<GiftAmendFacilityResponse> => {
  const maybeApiModule: unknown = apiModule;

  if (!hasGiftAmendApi(maybeApiModule)) {
    return false;
  }

  const payload = buildAmendmentPayload(amendment);

  if (!payload) {
    return false;
  }

  const response = await maybeApiModule.amendGiftFacility(payload, ukefFacilityId);

  return response;
};
