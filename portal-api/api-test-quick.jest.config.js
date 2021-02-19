const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['src/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/gef/application/*.api-test.js'],
  ...commonSettings,
};
