const { defineConfig } = require('cypress');
const dotenv = require('dotenv');
const path = require('path');
const { createTasks } = require('../support/tasks');

// Read from root `./.env` directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { CONTACT_US_EMAIL_ADDRESS, PORTAL_API_KEY, TZ } = process.env;

module.exports = defineConfig({
  env: {
    TZ,
    CONTACT_US_EMAIL_ADDRESS,
  },
  apiProtocol: 'http://',
  apiHost: 'localhost',
  apiPort: '5001',
  apiKey: PORTAL_API_KEY,
  centralApiProtocol: 'http://',
  centralApiHost: 'localhost',
  centralApiPort: '5005',
  tfmApiProtocol: 'http://',
  tfmApiHost: 'localhost',
  tfmApiPort: '5004',
  dbName: 'dtfs-submissions',
  dbConnectionString: 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT&directConnection=true',
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 180000,
  responseTimeout: 120000,
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
    setupNodeEvents(on) {
      on('task', createTasks());
    },
  },
  experimentalCspAllowList: ['child-src', 'default-src', 'frame-src', 'form-action', 'script-src', 'script-src-elem'],
});
