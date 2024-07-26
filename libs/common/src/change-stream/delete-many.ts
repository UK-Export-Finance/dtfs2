import 'dotenv/config.js';
import { DeleteResult, Filter, ObjectId, TransactionOptions, WithoutId } from 'mongodb';
import { add } from 'date-fns';
import { AuditDetails, DbModel, DeletionAuditLog, MongoDbCollectionName } from '../types';
import { MongoDbClient } from '../mongo-db-client';
import { generateAuditDatabaseRecordFromAuditDetails } from './generate-audit-database-record';
import { changeStreamConfig } from './config';
import { DocumentNotFoundError, WriteConcernError } from '../errors';

const { DELETION_AUDIT_LOGS_TTL_SECONDS } = changeStreamConfig;

type DeleteManyParams<CollectionName extends MongoDbCollectionName> = {
  filter: Filter<WithoutId<DbModel<CollectionName>>>;
  collectionName: CollectionName;
  db: MongoDbClient;
  auditDetails: AuditDetails;
};

/**
 * @throws {DocumentNotFoundError} - if there are no documents matching the filter to delete
 * @throws {WriteConcernError} - if either the deletion-audit-log insertion or document deletion operations are not acknowledged
 */
const deleteManyWithAuditLogs = async <CollectionName extends MongoDbCollectionName>({
  filter,
  collectionName,
  db,
  auditDetails,
}: DeleteManyParams<CollectionName>): Promise<DeleteResult> => {
  const client = await db.getClient();
  const session = client.startSession();

  try {
    const transactionOptions: TransactionOptions = {
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    };

    let transactionDeleteResult: DeleteResult = { deletedCount: 0, acknowledged: false };
    await session.withTransaction(async () => {
      const collection = await db.getCollection(collectionName);
      const documentsToDeleteIds = await collection
        .find(filter, { session })
        .project<{ _id: ObjectId }>({ _id: 1 })
        .map(({ _id }) => _id)
        .toArray();

      if (!documentsToDeleteIds.length) {
        throw new DocumentNotFoundError();
      }

      const logsToInsert: WithoutId<DeletionAuditLog>[] = documentsToDeleteIds.map((deletedDocumentId) => ({
        collectionName,
        deletedDocumentId,
        auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
        expireAt: add(new Date(), { seconds: DELETION_AUDIT_LOGS_TTL_SECONDS }),
      }));

      const deletionCollection = await db.getCollection('deletion-audit-logs');
      const insertResult = await deletionCollection.insertMany(logsToInsert, { session });
      if (!insertResult.acknowledged) {
        throw new WriteConcernError();
      }

      const deleteManyFilter = {
        _id: { $in: documentsToDeleteIds },
      } as unknown as Filter<WithoutId<DbModel<CollectionName>>>;
      const deleteResult = await collection.deleteMany(deleteManyFilter, { session });
      if (!(deleteResult.acknowledged && deleteResult.deletedCount === documentsToDeleteIds.length)) {
        throw new WriteConcernError();
      }
      transactionDeleteResult = { ...deleteResult };
    }, transactionOptions);
    return transactionDeleteResult;
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
export const deleteMany = async <CollectionName extends MongoDbCollectionName>({
  filter,
  collectionName,
  db,
  auditDetails,
}: DeleteManyParams<CollectionName>): Promise<DeleteResult> => {
  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    return await deleteManyWithAuditLogs({
      filter,
      collectionName,
      db,
      auditDetails,
    });
  }
  const collection = await db.getCollection(collectionName);
  return await collection.deleteMany(filter);
};
