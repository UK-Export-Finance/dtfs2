export type ApimGiftFacilityOverviewPayload = {
  creditType: string;
  currency: string;
  facilityAmount: number;
  facilityId: string;
  facilityName: string;
  effectiveDate: string;
  expiryDate: string;
  isRevolving: boolean;
  obligorUrn: string;
  productTypeCode: string; // TODO: typeof
};

export type ApimGiftFacilityRiskDetailsPayload = {
  account: string;
  dealId: string;
  facilityCategoryCode: string | null;
  facilityCreditRating: string;
  riskStatus: string;
  ukefIndustryCode: string;
};

// TODO: rename/mention APIM payload?
export type ApimGiftFacilityCreationPayload = {
  consumer: string; // TODO: typeof
  overview: ApimGiftFacilityOverviewPayload;
  counterparties: any[]; // TODO: DTFS2-8314
  obligations: any[]; // TODO: DTFS2-8315
  repaymentProfiles: any[]; // TODO: DTFS2-8316
  riskDetails: ApimGiftFacilityRiskDetailsPayload;
};
