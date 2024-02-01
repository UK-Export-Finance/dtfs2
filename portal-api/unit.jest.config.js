const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  preset: 'ts-jest/presets/js-with-babel',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.{js,ts}'],
};
