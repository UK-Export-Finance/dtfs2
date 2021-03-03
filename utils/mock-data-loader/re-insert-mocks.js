const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const init = async () => {
  await cleanAllTables();
  await insertMocks();
  await cleanAllTablesGef();
  await insertMocksGef();
  await cleanAllTablesTfm();
  await insertMocksTfm();
};
init();
