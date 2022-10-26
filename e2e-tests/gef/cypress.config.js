const { defineConfig } = require('cypress');

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
  projectId: 'sefntb',
  pageLoadTimeout: 120000,
  responseTimeout: 120000,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost',
    specPattern: 'cypress/e2e/**/*.spec.js',
  },
});
