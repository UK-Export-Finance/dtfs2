const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  collectCoverageFrom: [
    'server/controllers/**/*.{js,}',
    'server/routes/**/*.{js,}',
    'server/helpers/*.{js,}',
    'scripts/**/*.{js,}',
  ],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.js'],
  modulePathIgnorePatterns: ['prototype'],
  testTimeout: 80000,
};
