import { ObjectId, TransactionOptions } from 'mongodb';
import { add } from 'date-fns';
import { AuditDetails, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';
import { changeStreamConfig } from './config';

const { DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS } = changeStreamConfig;

type DeleteDocumentWithAuditLogsParams = {
  documentId: ObjectId;
  collectionName: MongoDbCollectionName;
  db: MongoDbClient;
  auditDetails: AuditDetails;
};

export const deleteDocumentWithAuditLogs = async ({ documentId, collectionName, db, auditDetails }: DeleteDocumentWithAuditLogsParams) => {
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
          expireAt: add(new Date(), { seconds: Number(DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS) }),
        },
        { session },
      );
      if (!insertResult.acknowledged) {
        throw new Error('Failed to create deletion audit log');
      }

      const collection = await db.getCollection(collectionName);
      const deleteResult = await collection.deleteOne({ _id: { $eq: documentId } }, { session });
      if (!(deleteResult.acknowledged && deleteResult.deletedCount === 1)) {
        throw new Error('Failed to delete document');
      }
    }, transactionOptions);
  } catch (error) {
    console.error(`Failed to delete document ${documentId.toString()} from collection ${collectionName}, rolling back changes.`);
    throw error;
  } finally {
    await session.endSession();
  }
};
