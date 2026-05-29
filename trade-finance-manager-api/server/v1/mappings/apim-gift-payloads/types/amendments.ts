import { APIM_GIFT_INTEGRATION } from '../constants';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

/**
 * Represents the partial data structure for a facility amendment from TFM.
 */
export type TfmFacilityAmendmentData = {
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
  tfm: {
    coverEndDate?: number;
  };
};

export type AmendmentAmountDataParams = {
  amount: number;
  date: string;
};

export type AmendmentDataPayloadIncreaseOrDecreaseAmount = AmendmentAmountDataParams;

export type AmendmentPayloadDecreaseAmount = {
  amendmentType: typeof AMENDMENT_TYPE.DECREASE_AMOUNT;
  amendmentData: AmendmentDataPayloadIncreaseOrDecreaseAmount;
};

export type AmendmentPayloadIncreaseAmount = {
  amendmentType: typeof AMENDMENT_TYPE.INCREASE_AMOUNT;
  amendmentData: AmendmentDataPayloadIncreaseOrDecreaseAmount;
};

export type AmendmentDataPayloadReplaceExpiryDate = {
  expiryDate: string;
};

export type AmendmentPayloadReplaceExpiryDate = {
  amendmentType: typeof AMENDMENT_TYPE.REPLACE_EXPIRY_DATE;
  amendmentData: AmendmentDataPayloadReplaceExpiryDate;
};

export type ApimGiftFacilityAmendmentPayload = AmendmentPayloadIncreaseAmount | AmendmentPayloadDecreaseAmount | AmendmentPayloadReplaceExpiryDate;

export type ApimGiftAmendmentType = (typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE)[keyof typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE];

export type ApimGiftAmountAmendmentType =
  | typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT
  | typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT;
