module.exports = {
  extends: ['airbnb-base', 'plugin:cypress/recommended'],
  env: {
    'cypress/globals': true,
    browser: true,
    node: true,
  },
  plugins: ['cypress'],
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
    'import/first': 'off',
    'import/order': 'off',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error',
    'cypress/unsafe-to-chain-command': 'warn',
    'no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 14,
  },
  globals: {
    cy: true,
  },
};
