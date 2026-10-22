import { ObjectId } from 'mongodb';
import { AuditDatabaseRecord } from '@ukef/types/audit-database-record';
import { AnyObject } from '@ukef/types/any-object';
import { Prettify } from '@ukef/types/types-helper';
import { TfmDealStage } from '@ukef/types/tfm/deal-stage';
import { TfmActivity } from './tfm-activity';
import { Deal } from './deals';
import { TfmDealCancellationWithStatus } from './tfm-deal-cancellation';
import { TfmParties } from './tfm-parties';

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
    parties: TfmParties;
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
