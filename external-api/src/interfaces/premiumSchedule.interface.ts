export interface PremiumSchedule {
  premiumTypeId: number;
  premiumFrequencyId: number;
  productGroup: string;
  facilityURN: number;
  guaranteeCommencementDate: string;
  guaranteeExpiryDate: string;
  guaranteeFeePercentage: number;
  guaranteePercentage: number;
  dayBasis: string;
  exposurePeriod: number;
  maximumLiability: number;
  cumulativeAmount: number;
}
