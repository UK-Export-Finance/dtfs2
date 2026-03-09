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

export type ApimGiftFacilityRiskDetails = {
  account: (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['RISK_DETAILS']['ACCOUNT'];
  dealId: string;
  facilityCategoryCode: string | null;
  facilityCreditRating: string;
  riskStatus: (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['RISK_DETAILS']['RISK_STATUS'];
  ukefIndustryCode: string;
};

export type ApimGiftFacilityCreationPayload = {
  consumer: (typeof APIM_GIFT_INTEGRATION)['CONSUMER'];
  overview: ApimGiftFacilityOverview;
  counterparties: any[]; // TODO: DTFS2-8314
  obligations: any[]; // TODO: DTFS2-8315
  repaymentProfiles: any[]; // TODO: DTFS2-8316
  riskDetails: ApimGiftFacilityRiskDetails;
};
