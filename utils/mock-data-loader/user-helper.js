const api = require('./api');
const MOCK_BANKS = require('./banks');

const mockDataLoaderUser = {
  username: 're-insert-mocks',
  password: 'AbC!2345',
  firstname: 'Mock',
  surname: 'DataLoader',
  roles: [],
  email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
  bank: MOCK_BANKS.find((bank) => bank.id === '9'),
};

const createAndLogInAsInitialUser = async () => {
  let token = await api.login(mockDataLoaderUser);

  if (!token) {
    console.info(`Creating user "${mockDataLoaderUser.username}"`);
    await api.createInitialUser(mockDataLoaderUser);
    token = await api.login(mockDataLoaderUser);
  }

  return token;
};

module.exports = { mockDataLoaderUser, createAndLogInAsInitialUser };
