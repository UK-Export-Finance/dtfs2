module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  collectCoverageFrom: ['server/routes/**/*.{js,ts}', 'server/controllers/**/*.{js,ts}', 'server/services/**/*.{js,ts}', 'server/utils/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.{js,ts}', '**/*.component-test.{js,ts}'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
};
