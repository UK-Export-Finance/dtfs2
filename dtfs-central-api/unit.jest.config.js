module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ['src/**/*.{js,ts}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.{js,ts}'],
  transformIgnorePatterns: ['/node_modules/(?!(@scure/base|@noble|@otplib|otplib)/)'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': ['ts-jest', { allowJs: true, tsconfig: { module: 'commonjs' } }],
  },
};
