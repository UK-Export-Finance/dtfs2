import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';

export type BssEwcsDeal = AnyObject & {
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
  };
};

export type GefDeal = AnyObject & {
  dealType: typeof DEAL_TYPE.GEF;
  ukefDealId: string;
};

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
