module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.{js,ts}'],
};
