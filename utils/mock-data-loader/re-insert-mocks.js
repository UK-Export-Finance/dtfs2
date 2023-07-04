const { createMockDataLoaderUser, mockDataLoaderUser } = require('./user-helper');
const api = require('./api');

const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const init = async () => {
  await createMockDataLoaderUser();
  const token = await api.login(mockDataLoaderUser);

  await cleanAllTables(token);
  await insertMocks(token);
  await cleanAllTablesGef(token);
  await insertMocksGef(token);
  await cleanAllTablesTfm(token);
  await insertMocksTfm(token);
};

init();
