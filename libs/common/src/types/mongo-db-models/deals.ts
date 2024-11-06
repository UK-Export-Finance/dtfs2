import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { DealSubmissionType } from '..';

export type BssEwcsDeal = AnyObject & {
  _id: ObjectId;
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
  };
  submissionType: DealSubmissionType;
};

export type GefDeal = AnyObject & {
  _id: ObjectId;
  dealType: typeof DEAL_TYPE.GEF;
  ukefDealId: string;
  submissionType: DealSubmissionType;
};

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
