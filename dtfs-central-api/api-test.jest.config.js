const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.{js,ts}'],
  testTimeout: 80000,
  workerIdleMemoryLimit: '512MB',
  ...commonSettings,
};
