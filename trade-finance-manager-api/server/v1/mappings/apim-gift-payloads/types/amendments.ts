import { APIM_GIFT_INTEGRATION } from '../constants';

type AmendmentType = typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE;

type DecreaseAmount = AmendmentType['DECREASE_AMOUNT'];
type IncreaseAmount = AmendmentType['INCREASE_AMOUNT'];
type ReplaceExpiryDate = AmendmentType['REPLACE_EXPIRY_DATE'];

/**
 * Represents the partial data structure for a facility amendment from TFM.
 */
export type TfmFacilityAmendmentData = {
  changeFacilityValue?: boolean;
  changeCoverEndDate?: boolean;
  value?: number | null;
  currentValue?: number | null;
  effectiveDate?: number;
  coverEndDate?: number | null;
  coveredPercentage?: number | null;
  previousCoveredPercentage?: number | null;
  ukefDecision?: {
    value?: string;
    coverEndDate?: string;
  };
  tfm?: {
    coverEndDate?: number;
  };
};

export type MapAmountParams = {
  coveredPercentage?: number | null;
  newAmount: number;
  previousAmount: number;
};

export type AmendmentAmountDataParams = {
  amount: number | null;
  date: string;
};

export type AmendmentDataPayloadIncreaseOrDecreaseAmount = AmendmentAmountDataParams;

export type AmendmentPayloadDecreaseAmount = {
  amendmentType: DecreaseAmount;
  amendmentData: AmendmentDataPayloadIncreaseOrDecreaseAmount;
};

export type AmendmentPayloadIncreaseAmount = {
  amendmentType: IncreaseAmount;
  amendmentData: AmendmentDataPayloadIncreaseOrDecreaseAmount;
};

export type AmendmentDataPayloadReplaceExpiryDate = {
  expiryDate: string;
};

export type AmendmentPayloadReplaceExpiryDate = {
  amendmentType: ReplaceExpiryDate;
  amendmentData: AmendmentDataPayloadReplaceExpiryDate;
};

export type ApimGiftFacilityAmendmentPayload = AmendmentPayloadIncreaseAmount | AmendmentPayloadDecreaseAmount | AmendmentPayloadReplaceExpiryDate;

export type MultipleAmendmentsPayload = {
  amendments: ApimGiftFacilityAmendmentPayload[];
};

export type ApimGiftAmendmentType = (typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE)[keyof typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE];

export type ApimGiftAmountAmendmentType =
  typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.INCREASE_AMOUNT | typeof APIM_GIFT_INTEGRATION.AMENDMENT_TYPE.DECREASE_AMOUNT;
