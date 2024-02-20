const db = require('./src/drivers/db-client');

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

afterAll(async () => {
  await db.close();
});
