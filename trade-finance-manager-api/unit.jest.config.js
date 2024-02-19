const commonSettings = require('./jest.common.config');

module.exports = {
  ...commonSettings,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.{js,ts}'],
  setupFilesAfterEnv: ['./unit-setup.jest.config.js'],
};
