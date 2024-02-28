const baseParserOptions = {
  ecmaVersion: 14,
};

const baseRules = {
  'no-console': ['error', { allow: ['info', 'error'] }],
  'no-underscore-dangle': [
    'error',
    { allow: ['_id', '_csrf', '_getBuffer', '_getData', '_getHeaders', '_getStatusCode', '_getRedirectUrl', '_getRenderData', '_getRenderView'] },
  ],
  'import/extensions': 'off',
  'import/first': 'off',
  'import/order': 'off',
  'import/no-named-as-default': 'off',
  'implicit-arrow-linebreak': 'off',
  'import/prefer-default-export': 'off',
  'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  'cypress/no-assigning-return-values': 'error',
  'cypress/no-unnecessary-waiting': 'error',
  'cypress/assertion-before-screenshot': 'warn',
  'cypress/no-force': 'warn',
  'cypress/no-async-tests': 'error',
  'cypress/no-pause': 'error',
  'cypress/unsafe-to-chain-command': 'warn',
  'no-use-before-define': [
    'error',
    {
      functions: false,
    },
  ],
};

module.exports = {
  extends: ['airbnb-base', 'prettier', 'plugin:cypress/recommended'],
  env: {
    'cypress/globals': true,
    node: true,
    browser: true,
  },
  globals: {
    cy: true,
  },
  plugins: ['cypress'],
  root: true,
  rules: baseRules,
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: baseParserOptions,
  overrides: [
    {
      files: ['*.ts'],
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended-type-checked', 'prettier'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...baseParserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        ...baseRules,
        '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNever: true }],
      },
    },
  ],
};
