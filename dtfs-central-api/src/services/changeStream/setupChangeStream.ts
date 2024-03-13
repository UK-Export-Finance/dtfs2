import { ChangeStreamDocument } from 'mongodb';
import { getCollection } from '../../drivers/db-client';
import { postAuditDetails } from './changeStreamApi';
import { DB_COLLECTIONS } from '../../constants/db-collections';
import { DbCollectionName } from '../../types/db-models/db-collection-name';

/**
 * Sets up a change stream on the mongodb database for a specific collection and sends any changes to the audit API
 * @param collectionName Name of the collection to set up the change stream for
 * @returns
 */
const setupChangeStreamForCollection = async (collectionName: DbCollectionName) => {
  console.info('Setting up change stream for collection', collectionName);
  const changeStream = (await getCollection(collectionName)).watch(
    [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }, { $project: { _id: 1, fullDocument: 1, ns: 1, documentKey: 1 } }],
    { fullDocument: 'updateLookup' },
  );
  changeStream.on('change', (changeStreamDocument: ChangeStreamDocument) => {
    console.info('Testing: ', changeStreamDocument);
    postAuditDetails(changeStreamDocument).catch((error) => {
      console.error('Error sending change stream update to API', error);
    });
  });
};

/**
 * Sets up a change stream on the mongodb database and sends any changes to the audit API
 * @returns
 */
export const setupChangeStream = async () => {
  try {
    console.info('Setting up mongodb change stream');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_key, collectionName] of Object.entries(DB_COLLECTIONS)) {
      await setupChangeStreamForCollection(collectionName);
    }
    console.info('Mongodb change stream initialised');
  } catch (error) {
    console.error('Error setting up mongodb change stream', error);
  }
};
