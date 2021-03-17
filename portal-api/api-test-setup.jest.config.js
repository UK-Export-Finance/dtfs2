
const axios = require('axios');
const corsAdapter = require('axios/lib/adapters/http');
const db = require('./src/drivers/db-client');

const mockFiles = [
  './src/v1/controllers/log-controller',
  './src/scheduler',
  './src/reference-data/api',
];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

beforeAll(() => {
  axios.defaults.adapter = corsAdapter;
});

afterAll(async (done) => {
  db.close();
  done();
});
