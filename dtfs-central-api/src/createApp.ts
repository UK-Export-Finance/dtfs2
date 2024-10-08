import { Express } from 'express';
import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { setupChangeStream } from './services/changeStream/setupChangeStream';
import { generateApp } from './generateApp';

export const createApp = async (): Promise<Express> => {
  try {
    await SqlDbDataSource.initialize();
    console.info('✅ Successfully initialised connection to SQL database');
  } catch (error) {
    console.error('❌ Failed to initialise connection to SQL database');
    throw error;
  }

  if (process.env.CHANGE_STREAM_ENABLED === 'true') {
    // This sets up the change stream for the database to send audit events to the audit API
    await setupChangeStream();
  }

  return generateApp();
};
