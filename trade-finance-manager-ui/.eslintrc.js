const baseParserOptions = {
  ecmaVersion: 2020,
};

const baseRules = {
  'no-console': ['error', { allow: ['info', 'error'] }],
  'no-underscore-dangle': [
    'error',
    { allow: ['_id', '_csrf', '_getBuffer', '_getData', '_getHeaders', '_getStatusCode', '_getRedirectUrl', '_getRenderData', '_getRenderView', '_isEndCalled'] },
  ],
  'import/extensions': 'off',
  'import/no-named-as-default': 'off',
  'implicit-arrow-linebreak': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    { devDependencies: ['**/*.test.{js,ts}', '**/*.api-test.{js,ts}', '**/*.spec.{js,ts}', '**/webpack.*.{js,ts}', '**/api-test*/**', '**/__mocks__/**'] },
  ],
  'import/prefer-default-export': 'off',
  'object-curly-newline': [
    'error',
    {
      consistent: true,
    },
  ],
  'no-return-await': 'off',
  'no-unneeded-ternary': 'off',
  'require-await': 'error',
  'no-use-before-define': [
    'error',
    {
      functions: false,
    },
  ],
};

module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: baseRules,
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/node_modules/**', '**/public/**'],
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
      },
    },
    {
      files: ['server/routes/**/*.ts'],
      rules: {
        ...baseRules,
        '@typescript-eslint/no-misused-promises': ['error', {
          checksVoidReturn: {
            arguments: false,
          },
        }],
      },
    },
  ],
};
