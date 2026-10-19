const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  {
    ignores: ['**/coverage/', '**/dist/', '**/node_modules/', '**/package*.json', 'public/', 'dtfs-mongo-volume-dtfs-submissions', 'dtfs-sql-volume-dtfs-submissions'],
  },
]);
