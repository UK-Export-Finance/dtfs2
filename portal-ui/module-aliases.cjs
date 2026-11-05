const path = require('node:path');

/**
 * Module alias for portal-ui's own source root (`server`, `scripts`, etc).
 * Mirrors ../libs/common/src/module-aliases.cjs so that `@ukef/portal-ui/*`
 * resolves consistently for TypeScript compilation, Jest, and ts-node runtime loading.
 */
module.exports = {
  baseUrl: __dirname,
  paths: { '@ukef/portal-ui/*': ['*'] },
  moduleNameMapper: {
    '^@ukef/portal-ui/(.+)$': path.join(__dirname, '$1'),
  },
};
