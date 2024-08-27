import { ObjectId, WithId } from 'mongodb';
import { AuditDatabaseRecord } from '../audit-database-record';

export type DeletionAuditLog = WithId<{
  collectionName: string;
  deletedDocumentId: ObjectId;
  auditRecord: AuditDatabaseRecord;
}>;
