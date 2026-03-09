import { APIM_GIFT_INTEGRATION, PRODUCT_TYPES } from './constants';

type CreditTypeMap = (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['OVERVIEW']['CREDIT_TYPE'];
type CreditTypeValue = CreditTypeMap[keyof CreditTypeMap];

export type ApimGiftFacilityOverview = {
  creditType: CreditTypeValue;
  currency: string;
  facilityAmount: number;
  facilityId: string;
  facilityName: string;
  effectiveDate: string;
  expiryDate: string;
  isRevolving: boolean;
  obligorUrn: string;
  productTypeCode: (typeof PRODUCT_TYPES)[keyof typeof PRODUCT_TYPES];
};

export type ApimGiftCounterparty = unknown; // TODO: DTFS2-8314 Define concrete shape

export type ApimGiftObligation = unknown; // TODO: DTFS2-8315 Define concrete shape

export type ApimGiftRepaymentProfile = unknown; // TODO: DTFS2-8316 Define concrete shape

export type ApimGiftFacilityRiskDetails = {
  account: (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['RISK_DETAILS']['ACCOUNT'];
  dealId: string;
  facilityCategoryCode: string | null;
  facilityCreditRating: string | null;
  riskStatus: (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['RISK_DETAILS']['RISK_STATUS'];
  ukefIndustryCode: string;
};

export type ApimGiftFacilityCreationPayload = {
  consumer: (typeof APIM_GIFT_INTEGRATION)['CONSUMER'];
  overview: ApimGiftFacilityOverview;
  counterparties: ApimGiftCounterparty[];
  obligations: ApimGiftObligation[];
  repaymentProfiles: ApimGiftRepaymentProfile[];
  riskDetails: ApimGiftFacilityRiskDetails;
};
