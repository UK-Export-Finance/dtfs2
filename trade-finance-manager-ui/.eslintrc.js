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
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/webpack.*.js', 'api-tests/**'] }],
    'object-curly-newline': ['error', {
      consistent: true,
    }],
    'no-unneeded-ternary': 'off',
    'require-await': 'error',
  },
  ignorePatterns: ['**/node_modules/**', '**/public/**'],
  parserOptions: {
    ecmaVersion: 2020,
  },
};
