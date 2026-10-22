const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  moduleNameMapper,
  preset: 'ts-jest',
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
};
