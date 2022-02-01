const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  globalTeardown: './test-teardown-globals.js',
  collectCoverageFrom: ['src/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.js'],
  ...commonSettings,
};
