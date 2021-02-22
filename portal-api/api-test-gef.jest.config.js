const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['src/v1/gef/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test/gef',
  testMatch: ['**/gef/*.api-test.js'],
  ...commonSettings,
};
