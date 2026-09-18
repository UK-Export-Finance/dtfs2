const commonSettings = require('./jest.common.config');

module.exports = {
  ...commonSettings,
  testTimeout: 30_000,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.{js,ts}'],
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
};
