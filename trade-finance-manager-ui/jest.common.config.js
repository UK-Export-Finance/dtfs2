const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    ...moduleNameMapper,
    '^@tfm-ui/(.+)$': '<rootDir>/server/$1',
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
};
