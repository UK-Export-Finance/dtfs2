const { moduleNameMapper } = require('./src/module-aliases.cjs');

module.exports = {
  moduleNameMapper,
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.{js,ts}'],
};
