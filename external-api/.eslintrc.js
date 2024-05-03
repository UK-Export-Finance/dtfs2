module.exports = {
  root: true,
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'plugin:prettier/recommended',
    'prettier/prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    jest: true,
    browser: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        paths: './tsconfig.json',
      },
    },
<<<<<<< Updated upstream
  },
  rules: {
    'import/no-unresolved': 'error',
    '@typescript-eslint/indent': ['error', 2],
    'prettier/prettier': [
      'error',
      {
        printWidth: 160,
        endOfLine: 'auto',
        parser: 'typescript',
=======
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
          {
            devDependencies: [
              '**/*.test.js',
              '**/*.spec.js',
              '**/webpack.*.js',
              '**/api-test*/**',
              '**/**api-test**',
              '**/__mocks__/**',
            ],
          },
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
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/indent': ['error', 2],
>>>>>>> Stashed changes
      },
    ],
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
    'no-underscore-dangle': [
      'error',
      { allow: ['_id', '_csrf', '_getBuffer', '_getData', '_getHeaders', '_getStatusCode', '_getRedirectUrl', '_getRenderData', '_getRenderView'] },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.test.{js,ts}', '**/*.spec.{js,ts}', '**/webpack.*.{js,ts}', '**/api-tests/**', '**/__mocks__/**'] },
    ],
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
  },
};
