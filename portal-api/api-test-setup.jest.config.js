const axios = require('axios');
const corsAdapter = require('axios/lib/adapters/http');
const db = require('./src/drivers/db-client');

const mockFiles = [
  './src/reference-data/api',
  './src/v1/email',
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

beforeAll(() => {
  axios.defaults.adapter = corsAdapter;
});

afterAll(async () => {
  await db.close();
});
