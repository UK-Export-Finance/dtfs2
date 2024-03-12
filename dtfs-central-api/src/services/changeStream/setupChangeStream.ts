import { ChangeStreamDocument } from 'mongodb';
import { getClient } from '../../drivers/db-client';
import { postAuditDetails } from './changeStreamApi';

/**
 * Sets up a change stream on the mongodb database and sends any changes to the audit API
 * @returns
 */
export const setupChangeStream = async () => {
  try {
    console.info('Setting up mongodb change stream');
    const database = await getClient();
    const changeStream = database.watch(
      [{ $match: { operationType: { $in: ['insert', 'update', 'replace'] } } }, { $project: { _id: 1, fullDocument: 1, ns: 1, documentKey: 1 } }],
      { fullDocument: 'updateLookup' },
    );
    changeStream.on('change', (changeStreamDocument: ChangeStreamDocument) => {
      console.info('Testing: ', changeStreamDocument);
      postAuditDetails(changeStreamDocument).catch((error) => {
        console.error('Error sending change stream update to API', error);
      });
    });
    console.info('Mongodb change stream initialised');
  } catch (error: any) {
    console.error('Error setting up mongodb change stream', error);
  }
};

// var cursor = database.watch(
//   [
//       { $match: { "operationType": { $in: ["insert", "update", "replace"] } } },
//       { $project: { "_id": 1, "fullDocument": 1, "ns": 1, "documentKey": 1 } }
//   ],
//   { fullDocument: "updateLookup" });
