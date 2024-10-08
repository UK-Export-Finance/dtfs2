module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
};
