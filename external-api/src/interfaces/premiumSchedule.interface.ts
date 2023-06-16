export interface PremiumSchedule {
  premiumTypeId: string;
  premiumFrequencyId: string;
  productGroup: string;
  facilityURN: string;
  guaranteeCommencementDate: string;
  guaranteeExpiryDate: string;
  guaranteeFeePercentage: string;
  guaranteePercentage: string;
  dayBasis: string;
  exposurePeriod: string;
  maximumLiability: number;
  cumulativeAmount: number;
}
