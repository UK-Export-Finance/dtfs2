import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '@ukef/constants';
import { AnyObject } from '@ukef/types/any-object';
import { PortalActivity } from '@ukef/types/portal';
import { Bank, DealSubmissionType } from '..';
import { BssEwcsSubmissionDetails } from './bss-deal';
import { GefExporter } from './gef-deal';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  bankInternalRefName: string;
  additionalRefName: string | null;
  submissionType: DealSubmissionType | null;
};

export type BssEwcsDeal = {
  bank: Bank;
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
    submissionCount: number;
  };
  submissionDetails: BssEwcsSubmissionDetails;
} & BaseDeal;

export type GefDeal = {
  bank: Bank;
  dealType: typeof DEAL_TYPE.GEF;
  eligibility: AnyObject;
  exporter: Partial<GefExporter>; // TODO: DTFS2-8349 - this should be updated to a complete type once all mock GEF deals use a fully populated exporter object.
  portalActivities: PortalActivity[];
  submissionCount: number;
  ukefDealId: string | null;
} & BaseDeal;

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
