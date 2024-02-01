module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  collectCoverageFrom: ['src/**/*.{js,}'],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*.test.js'],
};
