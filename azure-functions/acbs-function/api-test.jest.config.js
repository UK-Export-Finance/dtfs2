const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['acbs*/*.{js,}', 'activity*/*.{js,}', 'helpers/**/*.{js,}', 'mappings/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.js'],
  ...commonSettings,
};
