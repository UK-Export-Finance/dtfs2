const commonSettings = require('./jest.common.config');

module.exports = {
  ...commonSettings,
  collectCoverageFrom: ['server/controllers/**/*.{js,ts}', 'server/routes/**/*.{js,ts}', 'server/helpers/**/*.{js,ts}', 'scripts/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.{js,ts}'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  testTimeout: 80000,
};
