import { PRODUCT_TYPES } from './constants';

export type ApimGiftFacilityOverview = {
  creditType: string;
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
  account: string;
  dealId: string;
  facilityCategoryCode: string | null;
  facilityCreditRating: string;
  riskStatus: string;
  ukefIndustryCode: string;
};

export type ApimGiftFacilityCreationPayload = {
  consumer: string; // TODO: typeof
  overview: ApimGiftFacilityOverview;
  counterparties: any[]; // TODO: DTFS2-8314
  obligations: any[]; // TODO: DTFS2-8315
  repaymentProfiles: any[]; // TODO: DTFS2-8316
  riskDetails: ApimGiftFacilityRiskDetails;
};
