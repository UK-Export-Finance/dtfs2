const commonConfig = require('./jest.common.config');

module.exports = {
  ...commonConfig,
  testMatch: ['**/*.component-test.{js,ts}'],
};
