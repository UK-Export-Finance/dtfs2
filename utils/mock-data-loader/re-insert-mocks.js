const { cleanAllTables } = require('./clean-all-tables');
const insertMocksPortal = require('./insert-mocks');
const insertMocksTfm = require('./tfm/insert-mocks-tfm');

const init = async () => {
  await cleanAllTables();
  await insertMocksPortal();
  await insertMocksTfm();
  process.exit();
};
init();
