const baseParserOptions = {
  ecmaVersion: 2020,
};

module.exports = {
  extends: 'airbnb-base',
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  rules: {
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
    'no-console': ['error', { allow: ['info', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.{ts,js}', '**/*.spec.{ts,js}', '**/webpack.*.{ts,js}', '**/api-tests/**', '**/__mocks__/**'] }],
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'comma-dangle': 'off',
    'no-loop-func': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
    'no-use-before-define': [
      'error',
      {
        functions: false
      }
    ]
  },
  ignorePatterns: ['**/node_modules/**'],
  parserOptions: baseParserOptions,
  settings: {
    'import/resolver': {
      typescript: {}
    }
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'airbnb-base',
        'plugin:@typescript-eslint/recommended-type-checked',
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
      rules: {
        'consistent-return': 'off',
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
      }
    },
  ],
};
