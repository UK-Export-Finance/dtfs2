module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.js'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
};
