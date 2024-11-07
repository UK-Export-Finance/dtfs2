import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { DealSubmissionType } from '..';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  submissionType: DealSubmissionType;
};

export interface BssEwcsDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
  };
}

export interface GefDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.GEF;
  ukefDealId: string;
  eligibility: AnyObject;
  exporter: AnyObject;
}

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
