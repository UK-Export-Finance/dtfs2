
const axios = require('axios');
const corsAdapter = require('axios/lib/adapters/http');

const mockFiles = [
  './src/v1/api',
  './src/v1/api-estore',
];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

beforeAll(() => {
  axios.defaults.adapter = corsAdapter;
});

afterAll(async (done) => {
  done();
});
