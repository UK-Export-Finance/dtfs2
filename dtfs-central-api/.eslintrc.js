const baseParserOptions = {
  ecmaVersion: 2020,
};

const baseRules = {
  'max-len': [
    'error',
    160,
    2,
    {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    },
  ],
  'no-console': ['error', { allow: ['info', 'error'] }],
  'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
  'import/extensions': 'off',
  'import/no-named-as-default': 'off',
  'implicit-arrow-linebreak': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/webpack.*.js', '**/api-tests/**', '**/__mocks__/**'] },
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
      rules: baseRules,
    },
  ],
};
