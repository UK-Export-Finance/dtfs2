module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'object-curly-newline': [
      'error',
      {
        consistent: true,
      },
    ],
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
};
