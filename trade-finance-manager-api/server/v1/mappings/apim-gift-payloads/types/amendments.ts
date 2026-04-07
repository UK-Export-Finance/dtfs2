import { APIM_GIFT_INTEGRATION } from '../constants';

const { AMENDMENT_TYPE } = APIM_GIFT_INTEGRATION;

export type AmendmentAmountDataParams = {
  amount: number;
  date: string;
};

export type AmendmentDataPayloadIncreaseOrDecreaseAmount = {
  amount: number;
  date: string;
};

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
