module.exports = {
  extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended-type-checked', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/extensions': 'off',
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.{js,ts}'] }],
    'import/prefer-default-export': 'off',
    'comma-dangle': 'off',
    'no-loop-func': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-return-await': 'off',
    'no-use-before-define': ['error', { functions: false }],
    '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
};
