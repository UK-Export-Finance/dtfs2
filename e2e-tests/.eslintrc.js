module.exports = {
  extends: ['airbnb-base', 'plugin:cypress/recommended'],
  env: {
    'cypress/globals': true,
    browser: true,
    node: true,
  },
  plugins: ['cypress'],
  rules: {
    'max-len': ['error', 160, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-console': ['error', { allow: ['info', 'error'] }],
    'import/first': 'off',
    'import/order': 'off',
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: false }],
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error',
  },
  parserOptions: {
    ecmaVersion: 12, // es2021
  },
  globals: {
    cy: true,
  },
};
