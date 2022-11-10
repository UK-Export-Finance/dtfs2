module.exports = {
  collectCoverageFrom: ['acbs*/*.{js,}', 'activity-*/*.{js,}', 'helpers/**/*.{js,}', 'mappings/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/api-test',
  testMatch: ['**/test.js'],
};
