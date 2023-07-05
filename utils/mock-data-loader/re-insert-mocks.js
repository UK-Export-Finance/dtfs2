const { createAndLogInAsInitialUser, deleteInitialUser } = require('./user-helper');

const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const init = async () => {
  const token = await createAndLogInAsInitialUser();

  await cleanAllTables(token);
  await insertMocks(token);
  await cleanAllTablesGef(token);
  await insertMocksGef(token);
  await cleanAllTablesTfm(token);
  await insertMocksTfm(token);

  await deleteInitialUser(token);
};

init();
