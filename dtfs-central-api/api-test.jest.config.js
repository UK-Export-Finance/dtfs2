module.exports = {
  globalTeardown: './api-test-teardown-globals.jest.config.js',
  collectCoverageFrom: ['src/**/*.{js}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.js'],
  testEnvironment: 'node',
  clearMocks: true,
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js', 'jest-extended/all'],
  reporters: ['default', ['jest-slow-test-reporter', { numTests: 8, warnOnSlowerThan: 600, color: true }]],
};
