const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.{js,ts}'],
  testTimeout: 80000,
  ...commonSettings,
};
