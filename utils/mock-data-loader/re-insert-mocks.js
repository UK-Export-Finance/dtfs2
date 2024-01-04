const { createAndLogInAsInitialTfmUser, createAndLogInAsInitialUser, deleteInitialUser, deleteInitialTFMUser } = require('./user-helper');
const db = require('./database/database-client');

const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const init = async () => {
  const portalToken = await createAndLogInAsInitialUser();

  await cleanAllTables(portalToken);
  await insertMocks(portalToken);
  await cleanAllTablesGef(portalToken);
  await insertMocksGef(portalToken);

  await cleanAllTablesTfm();

  const tfmToken = await createAndLogInAsInitialTfmUser();
  await insertMocksTfm(tfmToken);

  await deleteInitialTFMUser(tfmToken);
  await deleteInitialUser(portalToken);

  db.close();
};

init();
