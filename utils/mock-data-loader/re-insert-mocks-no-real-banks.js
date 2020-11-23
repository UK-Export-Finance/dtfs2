const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks-no-real-banks');

cleanAllTables().then(insertMocks);
