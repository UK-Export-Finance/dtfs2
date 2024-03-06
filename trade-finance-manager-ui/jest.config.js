module.exports = {
  collectCoverageFrom: [
    'server/controllers/**/*.{js,}',
    'server/routes/**/*.{js,}',
    'server/helpers/*.{js,}',
    'scripts/**/*.{js,}',
  ],
  coverageDirectory: 'generated_reports/coverage/unit',
  testMatch: ['**/*server/routes/facilities/index.test.js'],
  modulePathIgnorePatterns: ['prototype'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
};
