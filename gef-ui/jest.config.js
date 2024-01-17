module.exports = {
  collectCoverageFrom: ['server/routes/**/*.{js,}', 'server/controllers/**/*.{js,}', 'server/services/**/*.{js,}', 'server/utils/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.js', '**/*.component-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
};
