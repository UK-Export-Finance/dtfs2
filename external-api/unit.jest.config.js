module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
};
