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
    'max-len': ['error', 160, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'no-underscore-dangle': ['error', { allow: ['_id', '_csrf'] }],
    'import/no-named-as-default': 'off',
    'implicit-arrow-linebreak': 'off',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js', '**/webpack.*.js', '**/api-tests/**', '**/__mocks__/**'] }],
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
  },
  ignorePatterns: ['**/node_modules/**', '**/public/**'],
  parserOptions: baseParserOptions,
  settings: {
    'import/resolver': {
      typescript: {},
    },
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
        'import/prefer-default-export': 'off',
        'import/extensions': 'off',
        'consistent-return': 'off',
      },
    },
  ],
};
