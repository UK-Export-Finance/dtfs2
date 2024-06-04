module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  collectCoverageFrom: [
    'server/controllers/**/*.{js,}',
    'server/routes/**/*.{js,}',
    'server/helpers/*.{js,}',
    'scripts/**/*.{js,}',
  ],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.api-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  testTimeout: 80000,
};
