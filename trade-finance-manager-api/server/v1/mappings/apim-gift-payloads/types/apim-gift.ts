import { APIM_GIFT_INTEGRATION, COUNTERPARTY_ROLE_CODE, PRODUCT_TYPE_CODES, REPAYMENT_TYPE } from '../constants';

type CreditTypeMap = (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['OVERVIEW']['CREDIT_TYPE'];
type CreditTypeValue = CreditTypeMap[keyof CreditTypeMap];

export type ApimGiftProductTypeCode = (typeof PRODUCT_TYPE_CODES)[keyof typeof PRODUCT_TYPE_CODES];

export type ApimGiftRepaymentType = (typeof REPAYMENT_TYPE)[keyof typeof REPAYMENT_TYPE];

export type ApimGiftFacilityOverview = {
  amount: number;
  creditType: CreditTypeValue;
  currency: string;
  facilityId: string;
  name: string;
  effectiveDate: string;
  expiryDate: string;
  obligorUrn: string;
  productTypeCode: ApimGiftProductTypeCode;
  repaymentType: ApimGiftRepaymentType;
};

export type ApimGiftCounterparty = {
  counterpartyUrn: string;
  startDate: string;
  exitDate: string;
  roleCode: (typeof COUNTERPARTY_ROLE_CODE)[keyof typeof COUNTERPARTY_ROLE_CODE];
};

export type ApimGiftObligation = {
  amount: number | null;
  currency: string;
  effectiveDate: string;
  maturityDate: string;
  repaymentType: ApimGiftRepaymentType;
  subtypeCode: string | null;
};

export type ApimGiftFacilityRiskDetails = {
  account: (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['RISK_DETAILS']['ACCOUNT'];
  dealId: string | null;
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
  riskDetails: ApimGiftFacilityRiskDetails;
};
