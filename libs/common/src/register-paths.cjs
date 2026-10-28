/**
 * Registers the module paths for the common library using tsconfig-paths.
 * This ensures that TypeScript can resolve the internal source directories correctly at runtime.
 */
const { register } = require('tsconfig-paths');
const { baseUrl, paths } = require('./module-aliases.cjs');

register({ baseUrl, paths, addMatchAll: false });
