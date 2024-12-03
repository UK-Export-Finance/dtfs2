const { mongoDbClient: db } = require('./src/drivers/db-client');

const mockFiles = ['./src/v1/api'];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

afterAll(async () => {
  await db.close();
});
