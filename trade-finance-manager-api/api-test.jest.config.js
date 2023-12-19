const commonSettings = require('./jest.common.config');

module.exports = {
  ...commonSettings,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.{js,ts}'],
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
};
