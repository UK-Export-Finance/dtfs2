const cleanAllTables = require('./clean-all-tables');
const insertMocks = require('./insert-mocks');

// GEF specific
const cleanAllTablesGef = require('./clean-all-tables-gef');
const insertMocksGef = require('./insert-mocks-gef');


cleanAllTables().then(() => {
  insertMocks().then(() => {
    console.log('\n === GEF SPECIFIC === \n');
    cleanAllTablesGef().then(insertMocksGef);
  });
});
