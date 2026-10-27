/**
 * Registers external-api's own module path alias using tsconfig-paths.
 * Required by ts-node (see tsconfig.json) so `@ukef/external-api/*` resolves at
 * runtime the same way it does for TypeScript compilation and Jest.
 */
const { register } = require('tsconfig-paths');
const { baseUrl, paths } = require('./module-aliases.cjs');

register({ baseUrl, paths, addMatchAll: false });
