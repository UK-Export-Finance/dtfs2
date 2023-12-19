const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  collectCoverageFrom: [
    'server/**/*.{js,ts}',
    'scripts/**/*.{js,ts}',
  ],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.{js,ts}'],
  modulePathIgnorePatterns: ['prototype'],
  testTimeout: 80000,
};
