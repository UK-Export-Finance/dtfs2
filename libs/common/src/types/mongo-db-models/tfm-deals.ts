import { ObjectId } from 'mongodb';
import { TfmDealCancellationWithStatus } from './tfm-deal-cancellation';
import { Deal } from './deals';
import { AuditDatabaseRecord } from '../audit-database-record';
import { AnyObject } from '../any-object';
import { Prettify } from '../types-helper';
import { TfmActivity } from './tfm-activity';
import { TfmDealStage } from '../tfm/deal-stage';

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
    stage: TfmDealStage;
    cancellation?: TfmDealCancellationWithStatus;
    tasks?: AnyObject[];
  };
  // Audit records may not exist on a deal if it has not been modified after Audit Logs is released
  auditRecord?: AuditDatabaseRecord;
};

/**
 * The type `TfmDeal` with the `tfm.cancellation` object required
 */
export type TfmDealWithCancellation = Prettify<TfmDeal & { tfm: { cancellation: TfmDealCancellationWithStatus } }>;
