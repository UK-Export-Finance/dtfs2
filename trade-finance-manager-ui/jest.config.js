const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  collectCoverageFrom: ['server/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.{js,ts}', '**/*.component-test.{js,ts}'],
  modulePathIgnorePatterns: ['prototype'],
};
