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
  referenceDataApiProtocol: 'http://',
  referenceDataApiHost: 'localhost',
  referenceDataApiPort: '5002',
  projectId: 'sefntb',
  responseTimeout: 100000,
  pageLoadTimeout: 120000,
  redirectionLimit: 60,
  numTestsKeptInMemory: 1,
  retries: {
    runMode: 3,
    openMode: 0,
  },
  e2e: {
    baseUrl: 'http://localhost:5003',
    specPattern: 'cypress/e2e/**/*.spec.js',
  },
});
