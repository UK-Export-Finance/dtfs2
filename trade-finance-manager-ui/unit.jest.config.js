const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  collectCoverageFrom: ['server/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.{js,ts}', '**/*.component-test.{js,ts}'],
  modulePathIgnorePatterns: ['prototype'],
};
