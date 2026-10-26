const path = require('path');
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
    '^cheerio/slim$': path.join(path.dirname(require.resolve('cheerio/package.json')), 'dist/commonjs/slim.js'),
    uuid: require.resolve('uuid'),
  },
};
