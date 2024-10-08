const commonSettings = require('./jest.common.config');

module.exports = {
  ...commonSettings,
  collectCoverageFrom: ['server/controllers/**/*.{js,ts}', 'server/routes/**/*.{js,ts}', 'server/helpers/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.{js,ts}', '**/*.component-test.{js,ts}'],
  testEnvironment: 'jsdom',
};
