module.exports = {
  collectCoverageFrom: [
    'server/controllers/**/*.{js,}',
    'server/routes/**/*.{js,}',
    'server/helpers/**/*.{js,}',
    'scripts/**/*.{js,}',
  ],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.js', '**/*.component-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
};
