const { createAndLogInAsInitialUser, deleteInitialUser, deleteInitialTFMUser } = require('./user-helper');

const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');

// TFM specific
const cleanAllTablesTfm = require('./tfm/clean-all-tables-tfm');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');
const tokenForTfmUser = require('./temporary-token-handler-tfm');

const init = async () => {
  const portalToken = await createAndLogInAsInitialUser();

  await cleanAllTables(portalToken);
  await insertMocks(portalToken);
  await cleanAllTablesGef(portalToken);
  await insertMocksGef(portalToken);

  await cleanAllTablesTfm();

  const tfmToken = await tokenForTfmUser({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['data-admin'],
    email: 're-insert-mocks-data-loader-tfm@ukexportfinance.gov.uk',
  });

  await insertMocksTfm(tfmToken);

  await deleteInitialTFMUser(tfmToken);
  await deleteInitialUser(portalToken);
};

init();
