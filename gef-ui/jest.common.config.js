const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    ...moduleNameMapper,
    '^.+\\.(css|less|scss)$': 'babel-jest',
    uuid: require.resolve('uuid'),
  },
};
