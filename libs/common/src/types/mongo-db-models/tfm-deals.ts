import { ObjectId } from 'mongodb';
import { AuditDatabaseRecord } from '../audit-database-record';
import { Deal } from './deal';

export type TfmDealCancellation = {
  reason: string;
  bankRequestDate: number;
  effectiveFrom: number;
};

/**
 * Type of the mongo db "tfm-deals" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmDeal = {
  _id: ObjectId;
  dealSnapshot: Deal;
  tfm: { cancellation: TfmDealCancellation };
  auditRecord: AuditDatabaseRecord;
};
