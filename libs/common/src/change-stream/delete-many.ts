import 'dotenv/config.js';
import type { Filter, TransactionOptions, WithoutId } from 'mongodb';
import type { AuditDetails, DeletionAuditLog, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';
import { DocumentNotFoundError, WriteConcernError } from '../errors';

type DeleteManyParams = {
  filter: Filter<any>;
  collectionName: MongoDbCollectionName;
  db: MongoDbClient;
  auditDetails: AuditDetails;
};

/**
 * @throws {DocumentNotFoundError} - if there are no documents matching the filter to delete
 * @throws {WriteConcernError} - if either the deletion-audit-log insertion or document deletion operations are not acknowledged
 */
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

      if (!documentsToDeleteIds.length) {
        throw new DocumentNotFoundError();
      }

      const logsToInsert: WithoutId<DeletionAuditLog>[] = documentsToDeleteIds.map((deletedDocumentId) => ({
        collectionName,
        deletedDocumentId,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
      }));

      const deletionCollection = await db.getCollection('deletion-audit-logs');
      const insertResult = await deletionCollection.insertMany(logsToInsert, { session });
      if (!insertResult.acknowledged) {
        throw new WriteConcernError();
      }

      const deleteResult = await collection.deleteMany({ _id: { $in: documentsToDeleteIds } }, { session });
      if (!(deleteResult.acknowledged && deleteResult.deletedCount === documentsToDeleteIds.length)) {
        throw new WriteConcernError();
      }
    }, transactionOptions);
  } catch (error) {
    console.error(`Failed to delete many from collection ${collectionName} with filter ${JSON.stringify(filter)}, rolling back changes.`);
    throw error;
  } finally {
    await session.endSession();
  }
};

/**
 * When the `CHANGE_STREAM_ENABLED` feature flag is enabled adds deletions audit logs and calls Collection.deleteMany.
 * @throws {DocumentNotFoundError} - if there are no documents matching the filter to delete
 * @throws {WriteConcernError} - if either the deletion-audit-log insertion or document deletion operations are not acknowledged
 */
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
