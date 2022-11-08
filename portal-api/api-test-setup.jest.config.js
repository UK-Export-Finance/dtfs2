const db = require('./src/drivers/db-client');

const mockFiles = [
  './src/reference-data/api',
];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

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

afterAll(async () => {
  await db.close();
});
