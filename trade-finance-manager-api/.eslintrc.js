module.exports = {
  extends: ['airbnb-base', 'prettier'],
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
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js', '**/*.api-test.js', '**/api-tests/**', '**/__mocks__/**'] },
    ],
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
  parserOptions: {
    ecmaVersion: 2020,
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/node_modules/**'],
};
