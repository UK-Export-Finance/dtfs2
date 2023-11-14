module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
    'class-methods-use-this': 'off',
    'max-len': ['error', 160, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'import/no-unresolved': 'error',
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.api-test.js', '**/api-tests/**'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'comma-dangle': 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
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
  parserOptions: {
    ecmaVersion: 2022,
  },
  ignorePatterns: ['**/node_modules/**']
};
