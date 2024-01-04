const baseParserOptions = {
  ecmaVersion: 2020,
};

module.exports = {
  extends: 'airbnb-base',
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
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
    'operator-linebreak': ['error', 'after'],
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.api-test.js', '**/api-tests/**', '**/__mocks__/**'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'object-curly-newline': [
      'error',
      {
        consistent: true,
      },
    ],
    'comma-dangle': 'off',
    'no-loop-func': 'off',
    'no-unused-vars': ['error'],
    'require-await': 'error',
    'no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
  },
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: baseParserOptions,
  overrides: [
    {
      files: ['*.ts'],
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended-type-checked'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...baseParserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
  ],
};
