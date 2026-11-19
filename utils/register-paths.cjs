/**
 * Registers utils's own baseUrl-relative imports using tsconfig-paths.
 * Required by ts-node (see tsconfig.json) so bare imports such as
 * `drivers/db-client` or `validate-facility-ids/helpers` resolve at runtime
 * the same way they do for TypeScript compilation (via `baseUrl`).
 */
const { register } = require('tsconfig-paths');

register({ baseUrl: __dirname, paths: {}, addMatchAll: true });
