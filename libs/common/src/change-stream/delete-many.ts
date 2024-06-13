import 'dotenv/config.js';
import type { Filter, TransactionOptions, WithoutId } from 'mongodb';
import { add } from 'date-fns';
import type { AuditDetails, DeletionAuditLog, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';
import { changeStreamConfig } from './config';

const { DELETION_AUDIT_LOGS_TTL_SECONDS } = changeStreamConfig;

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
      const documentsToDeleteIds = (await collection.find(filter, { projection: { _id: true }, session }).toArray()).map(({ _id }) => _id);

      if (documentsToDeleteIds.length) {
        const logsToInsert: WithoutId<DeletionAuditLog>[] = documentsToDeleteIds.map((deletedDocumentId) => ({
          collectionName,
          deletedDocumentId,
          auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
          expireAt: add(new Date(), { seconds: DELETION_AUDIT_LOGS_TTL_SECONDS }),
        }));

        const deletionCollection = await db.getCollection('deletion-audit-logs');
        const insertResult = await deletionCollection.insertMany(logsToInsert, { session });
        if (!insertResult.acknowledged) {
          throw new Error('Failed to create deletion audit logs');
        }

        const deleteResult = await collection.deleteMany({ _id: { $in: documentsToDeleteIds } }, { session });
        if (!(deleteResult.acknowledged && deleteResult.deletedCount === documentsToDeleteIds.length)) {
          throw new Error('Failed to delete documents');
        }
      }
    }, transactionOptions);
  } catch (error) {
    console.error(`Failed to delete many from collection ${collectionName} with filter ${JSON.stringify(filter)}, rolling back changes.`);
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
  const collection = await db.getCollection(collectionName);
  return collection.deleteMany(filter);
};
