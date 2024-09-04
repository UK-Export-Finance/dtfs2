import { SqlDbDataSource } from '@ukef/dtfs2-common/sql-db-connection';
import { testApi } from './api-tests/test-api';
import { mongoDbClient as db } from './src/drivers/db-client';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

jest.mock('./src/services/changeStream/setupChangeStream', () => ({
  setupChangeStream: jest.fn(),
}));

beforeAll(async () => {
  await testApi.initialise();
});

afterAll(async () => {
  await db.close();
  await SqlDbDataSource.destroy();
});
