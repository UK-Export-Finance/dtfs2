const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  moduleNameMapper: {
    '^@ukef/external-api/(.*)$': '<rootDir>/$1',
    ...moduleNameMapper,
  },
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.ff-test.ts'],
  preset: 'ts-jest',
};
