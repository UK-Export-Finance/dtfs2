const {
  createAndLogInAsInitialTfmUser, createAndLogInAsInitialUser, deleteInitialUser, deleteInitialTFMUser
} = require('./user-helper');
const db = require('./database/database-client');

const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');
const { logger, LOGGER_COLOURS } = require('./helpers/logger.helper');

const init = async () => {
  logger({ message: 'REINSERTING MOCKS', colour: LOGGER_COLOURS.bright });

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

  logger({ message: 'REINSERTING MOCKS COMPLETE', colour: LOGGER_COLOURS.bright });
};

init();
