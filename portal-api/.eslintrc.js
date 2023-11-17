module.exports = {
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-base', 'prettier'],
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
    'import/no-unresolved': 'error',
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['^draft', 'req', 'res'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    'no-loop-func': 'off',
    'no-unused-vars': ['error'],
    'object-curly-newline': ['error', {
      consistent: true,
    }],
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'no-use-before-define': [
      'error',
      {
        functions: false
      }
    ]
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: ['**/node_modules/**']
};
