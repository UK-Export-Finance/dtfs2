const axios = require('axios');
const corsAdapter = require('axios/lib/adapters/http');
const db = require('./src/drivers/db-client');

const mockFiles = [
  './src/v1/api',
];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

console.log(`MOCKED FILES: \n${mockFiles.join('\n')}`);

beforeAll(() => {
  axios.defaults.adapter = corsAdapter;
});

afterAll(async () => {
  await db.close();
});
