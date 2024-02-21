const baseParserOptions = {
  ecmaVersion: 2020,
};

const baseRules = {
  'max-len': ['error', 160, 2, {
    ignoreUrls: true,
    ignoreComments: false,
    ignoreRegExpLiterals: true,
    ignoreStrings: true,
    ignoreTemplateLiterals: true,
  }],
  'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
  'no-return-await': 'off',
  'no-underscore-dangle': [
    'error',
    { allow: ['_id', '_csrf', '_getBuffer', '_getData', '_getHeaders', '_getStatusCode', '_getRedirectUrl', '_getRenderData', '_getRenderView'] },
  ],
  'import/no-named-as-default': 'off',
  'import/prefer-default-export': 'off',
  'import/extensions': 'off',
  'implicit-arrow-linebreak': 'off',
  'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/webpack.*.{js,ts}', '**/api-tests/**', '**/__mocks__/**'] }],
  'object-curly-newline': ['error', {
    consistent: true,
  }],
  'no-restricted-syntax': 'off',
  'no-use-before-define': [
    'error',
    {
      functions: false,
    },
  ],
};

module.exports = {
  extends: ['airbnb-base', 'prettier'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: baseRules,
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  ignorePatterns: ['**/node_modules/**', '**/public/**'],
  parserOptions: baseParserOptions,
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
      rules: baseRules,
    },
  ],
};
