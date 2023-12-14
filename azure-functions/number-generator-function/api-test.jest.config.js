module.exports = {
  collectCoverageFrom: [
    'numbergenerator*/*.{js,}',
    'activity*/*.{js,}',
    'helpers/**/*.{js,}',
    'controllers/**/*.{js,}',
  ],
  coverageDirectory: 'generated_reports/coverage/test',
  testMatch: ['**/*.api-test.js'],
};
