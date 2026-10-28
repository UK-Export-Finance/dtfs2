const path = require('node:path');

/**
 * Module aliases for the common library.
 * Provides mappings for Jest and Webpack to resolve internal source directories correctly.
 */
const sourceDirectories = [
  'change-stream',
  'constants',
  'cron-scheduler',
  'errors',
  'helpers',
  'interfaces',
  'middleware',
  'mongo-db-client',
  'nunjucks-filters',
  'schemas',
  'sql-db-connection',
  'sql-db-entities',
  'swagger',
  'test-helpers',
  'types',
  'ui-scripts',
  'utils',
];

/**
 * Exports the configuration for module resolution, including Jest's moduleNameMapper and Webpack's aliases.
 * This allows the common library to be imported correctly in both Jest tests and Webpack builds.
 */
module.exports = {
  baseUrl: __dirname,
  paths: { '@ukef/*': ['*'] },
  moduleNameMapper: {
    '^@ukef/(?!dtfs2-common(?:/|$))(.+)$': path.join(__dirname, '$1'),
  },
  webpackAliases: Object.fromEntries(sourceDirectories.map((directory) => [`@ukef/${directory}`, path.join(__dirname, directory)])),
};
