const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  collectCoverageFrom: ['acbs*/*.{js,}', 'activity*/*.{js,}', 'helpers/**/*.{js,}', 'mappings/**/*.{js,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.js'],
  ...commonSettings,
};
