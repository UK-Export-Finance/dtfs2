const { defineConfig } = require('cypress');
const { createTasks } = require('../support/tasks');
const path = require('path');

require('dotenv').config({ path: `${path.resolve(__dirname, '../..')}/.env` });

module.exports = defineConfig({
  centralApiProtocol: 'http://',
  centralApiHost: 'localhost',
  centralApiPort: '5005',
  dealApiProtocol: 'http://',
  dealApiHost: 'localhost',
  dealApiPort: '5001',
  tfmApiProtocol: 'http://',
  tfmApiHost: 'localhost',
  tfmApiPort: '5004',
  // TODO: Read value from environment variable
  apiKey: 'test',
  dbName: 'dtfs-submissions',
  dbConnectionString: 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT',
  redisHost: 'localhost',
  redisPort: '6379',
  redisKey: '',
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  jwtSigningKey: process.env.JWT_SIGNING_KEY,
  cookieSigningKey: process.env.SESSION_SECRET,
  e2e: {
    baseUrl: 'http://localhost:5000',
    specPattern: 'cypress/e2e/**/*.spec.js',
    setupNodeEvents(on, config) {
      const {
        dbName,
        dbConnectionString,
        redisHost,
        redisPort,
        redisKey,
      } = config;
      on('task', createTasks({
        dbName,
        dbConnectionString,
        redisHost,
        redisPort,
        redisKey,
      }));
    },
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
