const baseParserOptions = {
  ecmaVersion: 2020,
};

const baseRules = {
  'no-console': ['error', { allow: ['info', 'error'] }],
  'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
  'import/extensions': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    { devDependencies: ['**/*.test.{js,ts}', '**/*.api-test.{js,ts}', '**/api-tests/**', '**/__mocks__/**'] },
  ],
  'import/no-named-as-default': 'off',
  'import/prefer-default-export': 'off',
  'implicit-arrow-linebreak': 'off',
  'object-curly-newline': [
    'error',
    {
      consistent: true,
    },
  ],
  'comma-dangle': 'off',
  'no-loop-func': 'off',
  'no-return-await': 'off',
  'no-unused-vars': ['error'],
  'require-await': 'error',
  'no-use-before-define': [
    'error',
    {
      functions: false,
    },
  ],
};

module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
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
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended-type-checked', 'plugin:prettier/recommended'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...baseParserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      rules: baseRules,
    },
  ],
};
