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
  dealApiProtocol: 'http://',
  dealApiHost: 'localhost',
  dealApiPort: '5001',
  centralApiProtocol: 'http://',
  centralApiHost: 'localhost',
  centralApiPort: '5005',
  tfmApiProtocol: 'http://',
  tfmApiHost: 'localhost',
  tfmApiPort: '5004',
  apiKey: PORTAL_API_KEY,
  dbName: 'dtfs-submissions',
  dbConnectionString: 'mongodb://root:r00t@localhost:27017/?authMechanism=DEFAULT&directConnection=true',
  pageLoadTimeout: 120000,
  responseTimeout: 120000,
  numTestsKeptInMemory: 1,
  viewportWidth: 1920,
  viewportHeight: 1080,
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
