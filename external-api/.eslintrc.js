const baseParserOptions = {
  ecmaVersion: 2022,
};

module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'plugin:prettier/recommended',
  ],
  env: {
    jest: true,
    browser: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ...baseParserOptions,
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        paths: './tsconfig.json',
      },
    },
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  rules: {
    'import/no-unresolved': 'error',
    '@typescript-eslint/indent': ['error', 2],
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
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-named-as-default': 'off',
    'import/extensions': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/newline-after-import': 'off',
    'import/first': 'off',
    'import/prefer-default-export': 'off',
    'consistent-return': 'off',
    'import/order': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-use-before-define': [
      'error',
      {
        functions: false,
      },
    ],
    'class-methods-use-this': 'off',

    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/webpack.*.js', '**/api-test*/**', '**/**api-test**', '**/__mocks__/**'] },
    ],
    'comma-dangle': 'off',
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'no-loop-func': 'off',
    'no-unused-vars': ['error'],
    'object-curly-newline': [
      'error',
      {
        consistent: true,
      },
    ],
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
  },
};
