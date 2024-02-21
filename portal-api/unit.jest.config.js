const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.{js,ts}'],
};
