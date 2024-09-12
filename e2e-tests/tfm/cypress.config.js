const { defineConfig } = require('cypress');
const dotenv = require('dotenv');
const path = require('path');
const { createTasks } = require('../support/tasks');

// Read from root `./.env` directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { TFM_API_KEY, FF_TFM_FACILITY_END_DATE_ENABLED } = process.env;

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
  referenceDataApiProtocol: 'http://',
  referenceDataApiHost: 'localhost',
  referenceDataApiPort: '5002',
  apiKey: TFM_API_KEY,
  dbName: 'dtfs-submissions',
  redisHost: 'localhost',
  redisPort: '6379',
  redisKey: '',
  dbConnectionString: 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT&directConnection=true',
  responseTimeout: 100000,
  pageLoadTimeout: 120000,
  redirectionLimit: 100,
  numTestsKeptInMemory: 1,
  viewportWidth: 1920, // TFM website max width is 1440px
  viewportHeight: 1080,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  jwtSigningKey: process.env.JWT_SIGNING_KEY,
  cookieSigningKey: process.env.SESSION_SECRET,
  azureSsoAuthority: `${process.env.AZURE_SSO_AUTHORITY}/`,
  e2e: {
    baseUrl: 'http://localhost:5003',
    specPattern: 'cypress/e2e/**/*.spec.js',
    setupNodeEvents(on, config) {
      const { dbName, dbConnectionString, redisHost, redisPort, redisKey } = config;
      on(
        'task',
        createTasks({
          dbName,
          dbConnectionString,
          redisHost,
          redisPort,
          redisKey,
        }),
      );
    },
  },
  env: {
    FF_TFM_FACILITY_END_DATE_ENABLED,
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
