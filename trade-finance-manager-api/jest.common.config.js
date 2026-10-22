const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  moduleNameMapper,
  preset: 'ts-jest',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
};
