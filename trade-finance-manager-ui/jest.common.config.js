const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    ...moduleNameMapper,
    '^.+\\.(css|less|scss)$': 'babel-jest',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
};
