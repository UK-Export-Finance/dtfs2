const axios = require('axios');
const corsAdapter = require('axios/lib/adapters/http');

const mockFiles = ['./src/v1/controllers/estore/eStoreApi.controller'];

mockFiles.forEach((mockFile) => {
  jest.mock(mockFile);
});

beforeAll(() => {
  axios.defaults.adapter = corsAdapter;
});
