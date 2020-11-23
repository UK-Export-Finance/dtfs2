module.exports = {
  collectCoverageFrom: [
    'server/routes/**/*.{js,}',
    'scripts/**/*.{js,}',
  ],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.js', '**/*.component-test.js'],
  modulePathIgnorePatterns: ['prototype'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
};
