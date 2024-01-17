const baseParserOptions = {
  ecmaVersion: 2022,
};

module.exports = {
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: baseParserOptions,
  overrides: [
    {
      files: ['*.ts'],
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended-type-checked', 'plugin:prettier/recommended'],
      plugins: ['@typescript-eslint', 'prettier'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...baseParserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['*.{j,t}s'],
      plugins: ['prettier'],
      rules: {
        'prettier/prettier': 'error',
        'class-methods-use-this': 'off',
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
        'import/no-unresolved': 'error',
        'no-console': ['error', { allow: ['info', 'error'] }],
        'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
        'import/no-extraneous-dependencies': [
          'error',
          { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/webpack.*.js', '**/**api-test**', '**/__mocks__/**'] },
        ],
        'import/no-named-as-default': 'off',
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
        'implicit-arrow-linebreak': 'off',
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
        'no-use-before-define': [
          'error',
          {
            functions: false,
          },
        ],
      },
    },
  ],
};
