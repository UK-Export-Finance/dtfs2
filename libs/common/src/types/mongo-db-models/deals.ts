import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { Bank, DealSubmissionType } from '..';
import { PortalActivity } from '../portal';
import { BssEwcsSubmissionDetails } from './bss-deal';
import { GefExporter } from './gef-deal';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  bankInternalRefName: string;
  additionalRefName: string | null;
  submissionType: DealSubmissionType | null;
};

export interface BssEwcsDeal extends BaseDeal {
  bank: Bank;
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
    submissionCount: number;
  };
  submissionDetails: BssEwcsSubmissionDetails;
}

export interface GefDeal extends BaseDeal {
  bank: Bank;
  dealType: typeof DEAL_TYPE.GEF;
  eligibility: AnyObject;
  exporter: GefExporter;
  portalActivities: PortalActivity[];
  submissionCount: number;
  ukefDealId: string | null;
}

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
