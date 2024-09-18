import { ObjectId } from 'mongodb';
import { TfmDealCancellation } from '../tfm-deal-cancellation';
import { Deal } from './deals';
import { AuditDatabaseRecord } from '../audit-database-record';

/**
 * Type of the mongo db "tfm-deals" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmDeal = {
  _id: ObjectId;
  dealSnapshot: Deal;
  tfm?: { cancellation: TfmDealCancellation };
  // Audit records may not exist on a deal if it has not been modified after Audit Logs is released
  auditRecord?: AuditDatabaseRecord;
};
