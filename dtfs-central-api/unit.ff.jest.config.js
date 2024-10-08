module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.ff-test.{js,ts}'],
  setupFilesAfterEnv: ['./unit-setup.jest.config.js'],
};
