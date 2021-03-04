const cleanAllTables = require('./clean-all-tables-tfm');
const insertMocks = require('./insert-mocks-tfm');


const reInsertTfmMocks = async () => {
  await cleanAllTables();
  await insertMocks();
};

reInsertTfmMocks();
