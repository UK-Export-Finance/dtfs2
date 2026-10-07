module.exports = {
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
