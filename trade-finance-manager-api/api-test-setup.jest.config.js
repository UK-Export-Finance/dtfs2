const { mongoDbClient: db } = require('./server/drivers/db-client');

const mockFiles = ['./server/v1/api'];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

beforeAll(async () => {
  if (!console.error.mock) {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  }
});

afterAll(async () => {
  await db.close();

  if (console.error.mock) {
    console.error.mockRestore();
  }
});
