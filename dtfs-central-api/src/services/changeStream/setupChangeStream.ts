import { ChangeStreamDocument } from 'mongodb';
import { getClient } from '../../drivers/db-client';
import { postAuditDetails } from './changeStreamApi';

export const setupChangeStream = async () => {
  console.info('Setting up mongodb change stream');
  const database = await getClient();
  const changeStream = database.watch([], { fullDocument: 'updateLookup' });
  changeStream.on('change', (changeStreamDocument: ChangeStreamDocument) => {
    postAuditDetails(changeStreamDocument).catch((error) => {
      console.error('Error sending change stream update to API', error);
    });
  });
  console.info('Mongodb change stream initialised');
};
