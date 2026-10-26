const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');
const { moduleNameMapper: externalApiModuleNameMapper } = require('./module-aliases.cjs');

module.exports = {
  moduleNameMapper: {
    /**
     * The service-scoped alias must come first: the shared common-library pattern below
     * only excludes '@ukef/dtfs2-common', so it would otherwise also match '@ukef/external-api/*'.
     */
    ...externalApiModuleNameMapper,
    ...moduleNameMapper,
  },
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.ff-test.ts'],
  preset: 'ts-jest',
};
