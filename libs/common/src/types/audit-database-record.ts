import { ObjectId } from 'mongodb';
import { IsoDateTimeStamp } from './date';

/**
 * The `auditRecord` property on all documents stored in mongodb
 */
export type AuditDatabaseRecord = {
  lastUpdatedAt: IsoDateTimeStamp;
  lastUpdatedByPortalUserId: ObjectId | null;
  lastUpdatedByTfmUserId: ObjectId | null;
  lastUpdatedByIsSystem: boolean | null;
  noUserLoggedIn: boolean | null;
};
