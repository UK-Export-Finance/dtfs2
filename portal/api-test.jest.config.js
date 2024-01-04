module.exports = {
  collectCoverageFrom: ['server/controllers/**/*.{js,}', 'server/routes/**/*.{js,}', 'server/helpers/**/*.{js,}', 'scripts/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/*.api-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  testTimeout: 80000,
};
