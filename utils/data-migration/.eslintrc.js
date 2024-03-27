const baseParserOptions = {
  ecmaVersion: 2020,
};

const baseRules = {
  'no-console': ['error', { allow: ['info', 'error'] }],
  'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
  'import/no-named-as-default': 'off',
  'import/prefer-default-export': 'off',
  'implicit-arrow-linebreak': 'off',
  'comma-dangle': 'off',
  'no-loop-func': 'off',
  'import/no-unresolved': 'error',
  'no-await-in-loop': 'off',
  'import/extensions': 'off',
  'no-restricted-syntax': 'off',
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
  parserOptions: baseParserOptions,
  ignorePatterns: ['**/node_modules/**'],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
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
