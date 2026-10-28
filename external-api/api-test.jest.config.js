const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');
const { moduleNameMapper: externalApiModuleNameMapper } = require('./module-aliases.cjs');

module.exports = {
  moduleNameMapper: {
    /**
     * The external-api alias must come first: the shared common-library pattern below
     * only excludes '@ukef/dtfs2-common', so it would otherwise also match '@ukef/external-api/*'.
     */
    ...externalApiModuleNameMapper,
    ...moduleNameMapper,
  },
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testTimeout: 80000,
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
};
