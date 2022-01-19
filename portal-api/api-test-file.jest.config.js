const commonSettings = require('./api-test-common.jest.config');

module.exports = {
  globalTeardown: './test-teardown-globals.js',
  ...commonSettings,
};
