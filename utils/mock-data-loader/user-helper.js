const axios = require('axios');
const MOCK_BANKS = require('./banks');
require('dotenv').config();

const portalApiUrl = process.env.DEAL_API_URL;
const API_KEY = process.env.API_KEY;

const mockDataLoaderUser = {
  username: 're-insert-mocks',
  password: 'AbC!2345',
  firstname: 'Mock',
  surname: 'DataLoader',
  roles: [],
  email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  bank: MOCK_BANKS.find((bank) => bank.id === '9'),
};

const createMockDataLoaderUser = async () => {
  console.info(`Creating user "${mockDataLoaderUser.username}"`);

  await axios({
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      Accepts: 'application/json',
    },
    url: `${portalApiUrl}/v1/user`,
    data: mockDataLoaderUser,
  }).catch((err) => { console.error(`err: ${err}`); });
};

module.exports = { mockDataLoaderUser, createMockDataLoaderUser };
