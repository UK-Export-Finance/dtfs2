module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  setupFilesAfterEnv: ['./api-test-setup.jest.config.js'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  testTimeout: 80000,
};
