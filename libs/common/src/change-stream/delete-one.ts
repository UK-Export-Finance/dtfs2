import { DeleteResult, ObjectId } from 'mongodb';
import { add } from 'date-fns';
import { AuditDetails, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';
import { changeStreamConfig } from './config';
import { DocumentNotDeletedError, WriteConcernError } from '../errors';

const { DELETION_AUDIT_LOGS_TTL_SECONDS } = changeStreamConfig;

type DeleteOneParams = {
  documentId: ObjectId;
  collectionName: MongoDbCollectionName;
  db: MongoDbClient;
  auditDetails: AuditDetails;
};
/**
 * @throws {WriteConcernError} - if either the deletion-audit-log insertion or document deletion operations are not acknowledged
 * @throws {DocumentNotDeletedError} - if the deletion operation is acknowledged but nothing is deleted
 */
const deleteDocumentWithAuditLogs = async ({ documentId, collectionName, db, auditDetails }: DeleteOneParams): Promise<DeleteResult> => {
  try {
    const deletionCollection = await db.getCollection('deletion-audit-logs');
    const insertResult = await deletionCollection.insertOne({
      collectionName,
      deletedDocumentId: documentId,
      auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      expireAt: add(new Date(), { seconds: DELETION_AUDIT_LOGS_TTL_SECONDS }),
    });

    if (!insertResult.acknowledged) {
      throw new WriteConcernError();
    }

    const collection = await db.getCollection(collectionName);
    const deleteResult = await collection.deleteOne({ _id: { $eq: documentId } });
    if (!deleteResult.acknowledged) {
      throw new WriteConcernError();
    }

    if (deleteResult.deletedCount === 0) {
      throw new DocumentNotDeletedError();
    }

    return deleteResult;
  } catch (error) {
    console.error(`Failed to delete document %s from collection %s. An inconsistent deletion audit record may have been created`, documentId, collectionName);
    throw error;
  }
};

/**
 * When the `CHANGE_STREAM_ENABLED` feature flag is enabled adds deletions audit logs and calls Collection.deleteOne.
 * @throws {WriteConcernError} - if either the deletion-audit-log insertion or document deletion operations are not acknowledged
 * @throws {DocumentNotDeletedError} - if the deletion operation is acknowledged but nothing is deleted
 */
export const deleteOne = async ({ documentId, collectionName, db, auditDetails }: DeleteOneParams): Promise<DeleteResult> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    return deleteDocumentWithAuditLogs({
      documentId,
      collectionName,
      db,
      auditDetails,
    });
  }

  const collection = await db.getCollection(collectionName);
  return collection.deleteOne({ _id: { $eq: documentId } });
};
