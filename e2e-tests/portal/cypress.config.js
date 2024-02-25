const { defineConfig } = require('cypress');
const { createTasks } = require('../support/tasks');

module.exports = defineConfig({
  apiProtocol: 'http://',
  apiHost: 'localhost',
  apiPort: '5001',
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
  pageLoadTimeout: 180000,
  numTestsKeptInMemory: 1,
  viewportWidth: 3840,
  viewportHeight: 2400,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost',
    specPattern: 'cypress/e2e/**/*.spec.js',
    setupNodeEvents(on, config) {
      const { dbName, dbConnectionString } = config;
      on('task', createTasks({ dbName, dbConnectionString }));
    },
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
