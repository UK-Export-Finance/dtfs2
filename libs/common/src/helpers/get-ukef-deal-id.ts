import { DEAL_TYPE } from '../constants';
import { Deal } from '../types';

/**
 * Returns the UKEF deal ID on a deal depending on the deal type
 * @param deal a BSS/EWCS or GEF deal
 * @returns the UKEF deal ID
 */
export const getUkefDealId = (deal: Deal): string | null => (deal.dealType === DEAL_TYPE.GEF ? deal.ukefDealId : deal.details.ukefDealId);
