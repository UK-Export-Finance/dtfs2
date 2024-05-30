const commonSettings = require('./jest.common.config');

module.exports = {
  ...commonSettings,
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.{js,ts}'],
  setupFilesAfterEnv: ['./unit-setup.jest.config.js'],
};
