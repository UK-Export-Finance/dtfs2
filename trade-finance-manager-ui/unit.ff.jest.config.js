const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  collectCoverageFrom: ['server/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.ff-test.{js,ts}', '**/*-ff.component-ff-test.{js,ts}'],
  modulePathIgnorePatterns: ['prototype'],
};
