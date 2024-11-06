import { DEAL_TYPE } from '../constants';
import { Deal } from '../types';

/**
 * Returns the ukef deal id on a deal depending on the deal type
 * @param deal a BSS/EWCS or GEF deal
 * @returns the ukef deal id
 */
export const getUkefDealId = (deal: Deal): string => (deal.dealType === DEAL_TYPE.GEF ? deal.ukefDealId : deal.details.ukefDealId);
