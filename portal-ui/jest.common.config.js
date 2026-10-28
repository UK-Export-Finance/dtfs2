const path = require('path');
const { moduleNameMapper } = require('../libs/common/src/module-aliases.cjs');
const { moduleNameMapper: portalUiModuleNameMapper } = require('./module-aliases.cjs');

module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  moduleNameMapper: {
    /**
     * The portal-ui alias must come first: the shared common-library pattern below.
     * only excludes '@ukef/dtfs2-common', so it would otherwise also match '@ukef/portal-ui/*'.
     */
    ...portalUiModuleNameMapper,
    ...moduleNameMapper,
    '^.+\\.(css|less|scss)$': 'babel-jest',
    '^cheerio/slim$': path.join(path.dirname(require.resolve('cheerio/package.json')), 'dist/commonjs/slim.js'),
    uuid: require.resolve('uuid'),
  },
};
