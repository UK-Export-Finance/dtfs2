module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalTeardown: './api-test-teardown.jest.config.js',
};
