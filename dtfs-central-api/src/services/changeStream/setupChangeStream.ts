import { ChangeStreamUpdateDocument, ChangeStreamInsertDocument, ChangeStreamReplaceDocument } from 'mongodb';
import { getConnection } from '../../drivers/db-client';
import { postAuditDetails } from './changeStreamApi';

/**
 * Sets up a change stream on the mongodb database for a specific collection and sends any changes to the audit API
 * @param collectionName Name of the collection to set up the change stream for
 */
const setupChangeStreamForCollection = async (collectionName: string) => {
  console.info('Setting up change stream for collection', collectionName);
  const databaseConnection = await getConnection();
  const changeStream = databaseConnection
    .collection(collectionName)
    .watch([{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }, { $project: { _id: 1, fullDocument: 1, ns: 1, documentKey: 1 } }], {
      fullDocument: 'updateLookup',
    });
  changeStream.on('change', (changeStreamDocument: ChangeStreamInsertDocument | ChangeStreamUpdateDocument | ChangeStreamReplaceDocument) => {
    console.info('Testing: ', changeStreamDocument);
    postAuditDetails(changeStreamDocument).catch((error) => {
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
    const databaseConnection = await getConnection();
    const collections = await databaseConnection.listCollections().toArray();
    await Promise.all(
      collections.map(async (collection) => {
        await setupChangeStreamForCollection(collection.name);
      }),
    );
    console.info('Mongodb change stream initialised');
  } catch (error) {
    console.error('Error setting up mongodb change stream', error);
  }
};
