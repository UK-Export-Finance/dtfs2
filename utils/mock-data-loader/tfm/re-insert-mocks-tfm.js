const cleanAllTables = require('./clean-all-tables-tfm');
const insertMocks = require('./insert-mocks-tfm');


cleanAllTables().then(() => {
  insertMocks();
});
