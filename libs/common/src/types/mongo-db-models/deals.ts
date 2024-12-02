import { ObjectId } from 'mongodb';
import { DEAL_TYPE } from '../../constants';
import { AnyObject } from '../any-object';
import { AuditDatabaseRecord, DealStatus, DealSubmissionType } from '..';

type BaseDeal = AnyObject & {
  _id: ObjectId;
  status: DealStatus;
  submissionType: DealSubmissionType | null;
  updatedAt: number;
  eligibility: AnyObject;
  bankInternalRefName: string;
  additionalRefName: string | null;
  maker: AnyObject;
  bank: AnyObject;
  auditRecord: AuditDatabaseRecord;
  exporter: AnyObject;
};

export interface BssEwcsDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.BSS_EWCS;
  details: {
    ukefDealId: string;
  };
  submissionDetails: AnyObject;
  facilities: (ObjectId | string)[];
  summary: AnyObject;
  comments: string[];
  editedBy: AnyObject[];
  bondTransactions: AnyObject;
  loanTransactions: AnyObject;
  supportingInformation: AnyObject;
}

export interface GefDeal extends BaseDeal {
  dealType: typeof DEAL_TYPE.GEF;
  ukefDealId: string | null;
  supportingInformation: {
    status: string;
  };
  createdAt: number;
}

/**
 * Type of the mongo db "deal" collection
 *
 * This type is incomplete and should be added
 * to as and when new properties are discovered
 */
export type Deal = BssEwcsDeal | GefDeal;
