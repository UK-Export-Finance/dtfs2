module.exports = {
  globalTeardown: './api-test-teardown-globals.jest.config.js',
  collectCoverageFrom: ['src/**/*.{js}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.js'],
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js', 'jest-extended/all'],
};
