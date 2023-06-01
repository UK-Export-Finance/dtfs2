module.exports = {
  extends: 'airbnb-base',
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
    'max-len': ['error', 160, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-named-as-default': 0,
    'implicit-arrow-linebreak': 0,
    'comma-dangle': 'off',
    'no-loop-func': 'off',
    'import/no-unresolved': 0,
    'no-await-in-loop': 0,
    'import/extensions': 0,
    'no-restricted-syntax': 0,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: ['**/node_modules/**']
};
