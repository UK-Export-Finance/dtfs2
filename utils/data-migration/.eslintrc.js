module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-named-as-default': 'off',
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
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: ['**/node_modules/**'],
};
