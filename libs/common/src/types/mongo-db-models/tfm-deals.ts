import { ObjectId } from 'mongodb';
import { TfmDealCancellationWithStatus } from './tfm-deal-cancellation';
import { Deal } from './deals';
import { AuditDatabaseRecord } from '../audit-database-record';
import { AnyObject } from '../any-object';
import { TfmActivity } from './tfm-activity';

/**
 * Type of the mongo db "tfm-deals" collection
 *
 * This type is likely incomplete and should be added
 * to as and when new properties are discovered
 */
export type TfmDeal = {
  _id: ObjectId;
  dealSnapshot: Deal;
  tfm: {
    activities: TfmActivity[];
    dateReceived: string;
    dateReceivedTimestamp: number;
    exporterCreditRating: string;
    lastUpdated: number;
    lossGivenDefault: number;
    parties: AnyObject;
    probabilityOfDefault: number;
    product: string;
    stage: string;
    cancellation?: TfmDealCancellationWithStatus;
  };
  // Audit records may not exist on a deal if it has not been modified after Audit Logs is released
  auditRecord?: AuditDatabaseRecord;
};
