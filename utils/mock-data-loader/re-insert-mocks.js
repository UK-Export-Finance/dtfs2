const { createUser, deleteAllUsers } = require('./user-helper');
const api = require('./api');
const MOCK_BANKS = require('./banks');
const { closeDbConnection } = require('./db-client');

const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const init = async () => {
  deleteAllUsers()

  const mockDataLoaderUser = {
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'checker', 'editor', 'data-admin'],
    email: 're-insert-mocks-data-loader@ukexportfinance.gov.uk',
    bank: MOCK_BANKS.find((bank) => bank.id === '9'),
  };

  await createUser(mockDataLoaderUser);
  const token = await api.login(mockDataLoaderUser);

  await cleanAllTables(token);
  await insertMocks(token);
  await cleanAllTablesGef(token);
  await insertMocksGef(token);
  await cleanAllTablesTfm(token);
  await insertMocksTfm(token);

  await closeDbConnection();
};

init();
