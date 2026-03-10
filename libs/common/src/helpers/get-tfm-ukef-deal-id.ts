import { DEAL_TYPE } from '../constants';
import { TfmDeal } from '../types';

/**
 * Returns the UKEF deal ID from a TFM deal structure, depending on the deal type
 * @param deal a BSS/EWCS or GEF deal
 * @returns the UKEF deal ID
 */
export const getTfmUkefDealId = (deal: TfmDeal): string | null => {
  const { dealSnapshot } = deal;

  const { dealType } = dealSnapshot;

  switch (dealType) {
    case DEAL_TYPE.BSS_EWCS:
      return dealSnapshot.details.ukefDealId;

    case DEAL_TYPE.GEF:
      return dealSnapshot.ukefDealId;

    default:
      return null;
  }
};
