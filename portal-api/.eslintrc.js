const baseParserOptions = {
  ecmaVersion: 2022,
};

module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: baseParserOptions,
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended-type-checked',
        'prettier',
      ],
      plugins: [
        '@typescript-eslint',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...baseParserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
    },
    {
      files: ['*.{j,t}s'],
      rules: {
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
        'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
        'no-param-reassign': ['error', { props: true, ignorePropertyModificationsForRegex: ['^draft', 'req', 'res'] }],
        'no-return-await': 'off',
        'no-underscore-dangle': [
          'error',
          { allow: ['_id', '_csrf', '_getBuffer', '_getData', '_getHeaders', '_getStatusCode', '_getRedirectUrl', '_getRenderData', '_getRenderView'] },
        ],
        'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.api-test.js', '**/api-tests/**'] }],
        'import/no-named-as-default': 'off',
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
        'implicit-arrow-linebreak': 'off',
        'comma-dangle': 'off',
        'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
        'no-loop-func': 'off',
        'no-unused-vars': ['error', { ignoreRestSiblings: true }],
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
