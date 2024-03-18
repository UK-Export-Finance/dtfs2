const { SqlDbDataSource } = require('@ukef/dtfs2-common/sql-db-connection');
const db = require('./src/drivers/db-client');

const mockFiles = [
  './src/external-api/api',
];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
  validate: jest.fn(),
}));

expect.extend({
  toBeNumberOrNull(received) {
    if (typeof received !== 'number'
      && received !== null) {
      return {
        pass: false,
        message: () => 'Expected a number or null value',
      };
    }

    return {
      pass: true,
    };
  },
});

beforeAll(async () => {
  await SqlDbDataSource.initialize();
})

afterAll(async () => {
  await db.close();
});
