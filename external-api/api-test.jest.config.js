module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  preset: 'ts-jest',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!(otplib|@otplib/plugin-base32-scure|@scure/base)/)'],
  testEnvironment: 'node',
  testTimeout: 80000,
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
};
