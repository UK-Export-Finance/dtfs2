import { APIM_GIFT_INTEGRATION, COUNTERPARTY_ROLE_CODE, PRODUCT_TYPE_CODES } from './constants';

export type PartyUrns = {
  bondGiver?: string;
  bondBeneficiary?: string;
  issuingBank?: string;
};

type CreditTypeMap = (typeof APIM_GIFT_INTEGRATION)['DEFAULTS']['OVERVIEW']['CREDIT_TYPE'];
type CreditTypeValue = CreditTypeMap[keyof CreditTypeMap];

export type ApimGiftProductTypeCode = (typeof PRODUCT_TYPE_CODES)[keyof typeof PRODUCT_TYPE_CODES];

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
  productTypeCode: ApimGiftProductTypeCode;
};

export type ApimGiftCounterparty = {
  counterpartyUrn: string;
  startDate: string;
  exitDate: string;
  roleCode: (typeof COUNTERPARTY_ROLE_CODE)[keyof typeof COUNTERPARTY_ROLE_CODE];
};

export type ApimGiftObligation = {
  currency: string;
  effectiveDate: string;
  maturityDate: string;
  amount: number | null;
  subtypeCode: string;
};

type ApimGiftRepaymentProfileAllocation = {
  amount: number;
  dueDate: string;
};

export type ApimGiftRepaymentProfile = {
  allocations: ApimGiftRepaymentProfileAllocation[];
  name: string;
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
  repaymentProfiles: ApimGiftRepaymentProfile[];
  riskDetails: ApimGiftFacilityRiskDetails;
};
