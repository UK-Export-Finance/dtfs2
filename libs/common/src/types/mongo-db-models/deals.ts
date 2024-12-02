import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { DealSubmissionType } from '..';
import { Activity } from '../portal';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  submissionType: DealSubmissionType | null;
  portalActivities: Activity[];
};

export interface BssEwcsDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
  };
}

export interface GefDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.GEF;
  ukefDealId: string | null;
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
