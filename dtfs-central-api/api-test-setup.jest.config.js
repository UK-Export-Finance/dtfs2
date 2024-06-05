const db = require('./src/drivers/db-client').default;

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

jest.mock('./src/services/changeStream/setupChangeStream', () => ({
  setupChangeStream: jest.fn(),
}));

afterAll(async () => {
  await db.close();
});
