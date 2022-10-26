const { defineConfig } = require('cypress');

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
  projectId: 'sefntb',
  chromeWebSecurity: false,
  pageLoadTimeout: 120000,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost:5000',
    specPattern: 'cypress/e2e/**/*.spec.js',
  },
});
