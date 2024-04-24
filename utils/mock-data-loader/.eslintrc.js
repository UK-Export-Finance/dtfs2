const baseParserOptions = {
  ecmaVersion: 2020,
};

const baseRules = {
  'no-console': ['error', { allow: ['info', 'error', 'warn'] }],
  'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
  'import/extensions': 'off',
  'import/no-named-as-default': 'off',
  'implicit-arrow-linebreak': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    { devDependencies: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/webpack.*.{js,ts}', '**/api-tests/**', '**/__mocks__/**'] },
  ],
  'import/prefer-default-export': 'off',
  'comma-dangle': 'off',
  'no-loop-func': 'off',
  'no-await-in-loop': 'off',
  'no-restricted-syntax': 'off',
  'no-return-await': 'off',
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
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNever: true }],
      },
    },
  ],
};
