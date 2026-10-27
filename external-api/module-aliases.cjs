const path = require('node:path');

/**
 * Module alias for external-api's own source root (`server`).
 * Mirrors ../libs/common/src/module-aliases.cjs so that `@ukef/external-api/*`
 * resolves consistently for the ESLint autofix, TypeScript compilation, ts-node
 * runtime loading, and Jest.
 */
module.exports = {
  baseUrl: __dirname,
  paths: { '@ukef/external-api/*': ['*'] },
  moduleNameMapper: {
    '^@ukef/external-api/(.+)$': path.join(__dirname, '$1'),
  },
};
