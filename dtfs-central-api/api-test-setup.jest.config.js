const { TestApi } = require('./api-tests/test-api');
const { mongoDbClient: db } = require('./src/drivers/db-client');

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

jest.mock('./src/services/changeStream/setupChangeStream', () => ({
  setupChangeStream: jest.fn(),
}));

beforeAll(async () => {
  await TestApi.initialise();
});

afterAll(async () => {
  await db.close();
});
