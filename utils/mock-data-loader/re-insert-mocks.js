const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

cleanAllTables().then(insertMocks);
