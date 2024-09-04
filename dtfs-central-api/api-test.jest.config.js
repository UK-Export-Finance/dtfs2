import commonSettings from './api-test-common.jest.config';

export default {
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.{js,ts}'],
  testTimeout: 80000,
  workerIdleMemoryLimit: '512MB',
  ...commonSettings,
};
