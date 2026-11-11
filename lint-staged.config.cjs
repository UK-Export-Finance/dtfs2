const buildEslintCommands = require('./scripts/lint-staged-eslint.cjs');

module.exports = {
  '**/package.json': 'sort-package-json',
  '**/*.{js,ts}': [buildEslintCommands, 'npx prettier --write'],
  '**/*.md': ['npx prettier --write', 'npx markdownlint-cli --config .markdownlint.json'],
  '**/*.yml': ['npx yaml-lint --ignore=**/node_modules --ignore=dtfs-mongo-volume-dtfs-submissions'],
  '**/*': ['npx cspell lint --gitignore --no-must-find-files --unique --no-progress --show-suggestions --color'],
};
