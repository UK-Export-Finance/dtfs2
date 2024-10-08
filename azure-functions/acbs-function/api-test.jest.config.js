const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  ...commonSettings,
  collectCoverageFrom: ['acbs*/*.{js,}', 'activity*/*.{js,}', 'helpers/**/*.{js,}', 'mappings/**/*.{js,}'],
};
