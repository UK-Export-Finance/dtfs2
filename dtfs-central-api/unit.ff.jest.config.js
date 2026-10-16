const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  moduleNameMapper,
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.ff-test.{js,ts}'],
};
