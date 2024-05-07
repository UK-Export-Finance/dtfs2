module.exports = {
  preset: 'ts-jest/presets/js-with-babel',
  collectCoverageFrom: [
    'server/routes/**/*.{js,}',
    'server/controllers/**/*.{js,}',
    'server/services/**/*.{js,}',
    'server/utils/**/*.{js,}',
  ],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.js', '**/*.component-test.js'],
  moduleNameMapper: {
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
};
