import { ChangeStreamUpdateDocument, ChangeStreamInsertDocument, ChangeStreamReplaceDocument } from 'mongodb';
import { DeletionAuditLog, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { mongoDbClient } from '../../drivers/db-client';
import { postAuditDetails, postDeletionAuditDetails } from './changeStreamApi';

/**
 * Sets up a change stream on the mongodb database for a specific collection and sends any changes to the audit API
 * @param collectionName Name of the collection to set up the change stream for
 */
const setupChangeStreamForCollection = async (collectionName: string) => {
  console.info('Setting up change stream for collection', collectionName);
  const databaseConnection = await mongoDbClient.getConnection();
  const changeStream = databaseConnection
    .collection(collectionName)
    .watch([{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }, { $project: { _id: 1, fullDocument: 1, ns: 1, documentKey: 1 } }], {
      fullDocument: 'updateLookup',
    });
  changeStream.on('change', (changeStreamDocument: ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamReplaceDocument) => {
    postAuditDetails(changeStreamDocument).catch((error) => {
      console.error('Error sending change stream update to API', error);
    });
  });
};

const setupChangeStreamForDeletionCollection = async () => {
  console.info('Setting up deletion change stream');
  const databaseConnection = await mongoDbClient.getConnection();
  const changeStream = databaseConnection
    .collection(MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS)
    .watch([{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }, { $project: { _id: 1, fullDocument: 1, ns: 1, documentKey: 1 } }], {
      fullDocument: 'updateLookup',
    });
  changeStream.on('change', (changeStreamDocument: ChangeStreamInsertDocument<DeletionAuditLog>) => {
    // Deletion audit logs should never be updated or replaced. Cosmos DB does not currently support filtering at the `watch` step
    // (See here https://learn.microsoft.com/en-us/answers/questions/356668/how-to-get-inserted-change-stream-data-use-cosmosd)
    if (changeStreamDocument.operationType !== 'insert') {
      throw new Error(`A document in deletion-audit-logs has been ${changeStreamDocument.operationType}d`);
    }
    postDeletionAuditDetails(changeStreamDocument).catch((error) => {
      console.error('Error sending change stream update to API', error);
    });
  });
};

/**
 * Sets up a change stream on the mongodb database and sends any changes to the audit API
 */
export const setupChangeStream = async () => {
  try {
    console.info('Setting up mongodb change stream');
    const databaseConnection = await mongoDbClient.getConnection();
    const collections = await databaseConnection.listCollections().toArray();
    await Promise.all(
      collections.map(async (collection) => {
        if (collection.name === MONGO_DB_COLLECTIONS.DELETION_AUDIT_LOGS) {
          await setupChangeStreamForDeletionCollection();
        } else {
          await setupChangeStreamForCollection(collection.name);
        }
      }),
    );
    console.info('Mongodb change stream initialised');
  } catch (error) {
    console.error('Error setting up mongodb change stream', error);
  }
};
