const { defineConfig } = require('cypress');
const { createTasks } = require('./cypress/support/tasks');
const db = require('../support/db-client');

module.exports = defineConfig({
  dealApiProtocol: 'http://',
  dealApiHost: 'localhost',
  dealApiPort: '5001',
  centralApiProtocol: 'http://',
  centralApiHost: 'localhost',
  centralApiPort: '5005',
  tfmApiProtocol: 'http://',
  tfmApiHost: 'localhost',
  tfmApiPort: '5004',
  // TODO: Read value from environment variable
  apiKey: 'test',
  dbName: 'dtfs-submissions',
  dbConnectionString: 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT',
  pageLoadTimeout: 120000,
  responseTimeout: 120000,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost',
    specPattern: 'cypress/e2e/**/*.spec.js',
    setupNodeEvents(on, config) {
      const { dbName, dbConnectionString } = config;
      const connectionOptions = { dbName, dbConnectionString };
      const usersCollectionName = 'users';

      const getUsersCollection = () => db.getCollection(usersCollectionName, connectionOptions);

      on('task', createTasks(getUsersCollection)); // TODO dtfs2-6745: consider pull out createtasks to a global area
    },
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
