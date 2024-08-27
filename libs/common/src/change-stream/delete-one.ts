import { DeleteResult, ObjectId, TransactionOptions } from 'mongodb';
import { AuditDetails, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';
import { DocumentNotDeletedError, WriteConcernError } from '../errors';

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
const deleteDocumentWithAuditLogs = async ({ documentId, collectionName, db, auditDetails }: DeleteOneParams) => {
  const client = await db.getClient();
  const session = client.startSession();

  try {
    const transactionOptions: TransactionOptions = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    };
    await session.withTransaction(async () => {
      const deletionCollection = await db.getCollection('deletion-audit-logs');
      const insertResult = await deletionCollection.insertOne(
        {
          collectionName,
          deletedDocumentId: documentId,
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        },
        { session },
      );
      if (!insertResult.acknowledged) {
        throw new WriteConcernError();
      }

      const collection = await db.getCollection(collectionName);
      const deleteResult = await collection.deleteOne({ _id: { $eq: documentId } }, { session });
      if (!deleteResult.acknowledged) {
        throw new WriteConcernError();
      }

      if (deleteResult.deletedCount === 0) {
        throw new DocumentNotDeletedError();
      }
    }, transactionOptions);
  } catch (error) {
    console.error(`Failed to delete document ${documentId.toString()} from collection ${collectionName}, rolling back changes.`);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * When the `CHANGE_STREAM_ENABLED` feature flag is enabled adds deletions audit logs and calls Collection.deleteOne.
 * @throws {WriteConcernError} - if either the deletion-audit-log insertion or document deletion operations are not acknowledged
 * @throws {DocumentNotDeletedError} - if the deletion operation is acknowledged but nothing is deleted
 */
export const deleteOne = async ({ documentId, collectionName, db, auditDetails }: DeleteOneParams): Promise<DeleteResult> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    await deleteDocumentWithAuditLogs({
      documentId,
      collectionName,
      db,
      auditDetails,
    });

    return { acknowledged: true, deletedCount: 1 };
  }

  const collection = await db.getCollection(collectionName);
  return await collection.deleteOne({ _id: { $eq: documentId } });
};
