import { ObjectId, WithId } from 'mongodb';
import { AuditDatabaseRecord } from '@ukef/types/audit-database-record';

export type DeletionAuditLog = WithId<{
  collectionName: string;
  deletedDocumentId: ObjectId;
  auditRecord: AuditDatabaseRecord;
  expireAt: Date;
}>;
