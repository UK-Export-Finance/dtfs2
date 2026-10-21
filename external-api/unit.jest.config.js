module.exports = {
  collectCoverageFrom: ['src/**/*.{ts,}'],
  coverageReporters: ['text', 'text-summary'],
  testMatch: ['**/*.test.ts'],
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@ukef/(?!dtfs2-common(?:/|$))(.*)$': '<rootDir>/$1',
  },
};
