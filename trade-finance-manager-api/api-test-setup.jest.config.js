const { mongoDbClient: db } = require('./server/drivers/db-client');

const mockFiles = ['./server/v1/api'];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

// not placed under a `@azure` scoped folder, so it needs an explicit factory instead of relying on Jest's automatic node_modules mock resolution
jest.mock('@azure/storage-file-share', () => require('./__mocks__/azure/storage-file-share'));

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
