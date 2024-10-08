module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 80000,
};
