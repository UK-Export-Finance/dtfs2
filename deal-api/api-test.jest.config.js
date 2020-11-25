const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['src/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  // testMatch: ['**/*.api-test.js'],
  testMatch: ['**/bond-issue-facility.api-test.js'],
  ...commonSettings,
};
