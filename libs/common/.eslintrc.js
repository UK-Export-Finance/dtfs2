module.exports = {
  extends: ['airbnb-base', 'prettier', 'plugin:@typescript-eslint/recommended-type-checked'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': [
      'error',
      {
        allow: [
          '_id',
          '_csrf',
          '_getBuffer',
          '_getData',
          '_getHeaders',
          '_getStatusCode',
          '_getRedirectUrl',
          '_getRenderData',
          '_getRenderView',
        ],
      },
    ],
    'import/extensions': 'off',
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '**/*.test.{js,ts}',
          '**/*.api-test.{js,ts}',
          '**/*.spec.{js,ts}',
          '**/webpack.*.{js,ts}',
          '**/api-test*/**',
          '**/__mocks__/**',
          '**/sql-db-seeder/**/*.ts'
        ],
      },
    ],
    'import/prefer-default-export': 'off',
    'comma-dangle': 'off',
    'no-loop-func': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-return-await': 'off',
    'no-use-before-define': ['error', { functions: false }],
    'class-methods-use-this': ['error', { exceptMethods: ['up', 'down', 'run'] }],
    '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
    '@typescript-eslint/restrict-template-expressions': ['error', { allowNever: true }],
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['^draft'] }],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
};
