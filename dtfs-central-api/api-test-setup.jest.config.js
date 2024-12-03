const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');
const { testApi } = require('./api-tests/test-api');
const { mongoDbClient: db } = require('./src/drivers/db-client');

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
