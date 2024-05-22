import 'dotenv/config.js';
import type { Filter, TransactionOptions } from 'mongodb';
import { add } from 'date-fns';
import type { AuditDetails, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';

// TODO: UPDATE THIS ON REBASE
const { DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS } = process.env;

type DeleteManyParams = {
  filter: Filter<any>;
  collectionName: MongoDbCollectionName;
  db: MongoDbClient;
  auditDetails: AuditDetails;
};

const deleteManyWithAuditLogs = async ({ filter, collectionName, db, auditDetails }: DeleteManyParams) => {
  const client = await db.getClient();
  const session = client.startSession();

  try {
    const transactionOptions: TransactionOptions = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    };
    await session.withTransaction(async () => {
      const collection = await db.getCollection(collectionName);
      const documentsToDelete = await collection.find(filter, { projection: { _id: true }, session }).toArray();

      const logsToInsert = documentsToDelete.map(({ _id }) => ({
        collectionName,
        deletedDocumentId: _id,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        expireAt: add(new Date(), { seconds: Number(DELETION_AUDIT_LOGS_DELETE_AFTER_SECONDS) }),
      }));

      if (documentsToDelete.length) {
        const deletionCollection = await db.getCollection('deletion-audit-logs');
        const insertResult = await deletionCollection.insertMany(logsToInsert, { session });
        if (!insertResult.acknowledged) {
          throw new Error('Failed to create deletion audit logs');
        }

        const deleteResult = await collection.deleteMany({ $or: documentsToDelete }, { session });
        if (!(deleteResult.acknowledged && deleteResult.deletedCount === documentsToDelete.length)) {
          throw new Error('Failed to delete documents');
        }
      }
    }, transactionOptions);
  } catch (error) {
    console.error(`Failed to delete many, rolling back changes. Deleting from collection ${collectionName} with filter ${JSON.stringify(filter)}`);
    throw error;
  } finally {
    await session.endSession();
  }
};

export const deleteMany = async ({ filter, collectionName, db, auditDetails }: DeleteManyParams): Promise<{ acknowledged: boolean }> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    await deleteManyWithAuditLogs({
      filter,
      collectionName,
      db,
      auditDetails,
    });

    return { acknowledged: true };
  }
  const durableFunctionLogsCollection = await db.getCollection(collectionName);
  return durableFunctionLogsCollection.deleteMany(filter);
};
