const baseParserOptions = {
  ecmaVersion: 2022,
};

const baseRules = {
  'no-console': ['error', { allow: ['info', 'error'] }],
  'prettier/prettier': 'error',
  'class-methods-use-this': 'off',
  'no-underscore-dangle': [
    'error',
    {
      allow: [
        '_id',
        '_csrf',
        '_getBuffer',
        '_getData',
        '_getHeaders',
        '_getJSONData',
        '_getStatusCode',
        '_getRedirectUrl',
        '_getRenderData',
        '_getRenderView',
        '_isEndCalled',
      ],
    },
  ],
  'import/extensions': 'off',
  'import/no-named-as-default': 'off',
  'implicit-arrow-linebreak': 'off',
  'import/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: true,
    },
  ],
  'import/prefer-default-export': 'off',
  'comma-dangle': 'off',
  'no-loop-func': 'off',
  'no-await-in-loop': 'off',
  'no-restricted-syntax': 'off',
  'no-return-await': 'off',
  'no-use-before-define': [
    'error',
    {
      functions: false,
    },
  ],
  'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
  'no-unused-vars': [
    'error',
    {
      varsIgnorePattern: '^_',
    },
  ],
  'object-curly-newline': [
    'error',
    {
      consistent: true,
    },
  ],
  'prefer-destructuring': [
    'error',
    {
      VariableDeclarator: {
        array: false,
        object: true,
      },
      AssignmentExpression: {
        array: false,
        object: false,
      },
    },
  ],
  'cypress/no-assigning-return-values': 'error',
  'cypress/no-unnecessary-waiting': 'error',
  'cypress/assertion-before-screenshot': 'warn',
  'cypress/no-force': 'warn',
  'cypress/no-async-tests': 'error',
  'cypress/no-pause': 'error',
  'cypress/unsafe-to-chain-command': 'warn',
};

module.exports = {
  extends: ['airbnb-base', 'plugin:cypress/recommended', 'plugin:prettier/recommended'],
  env: {
    jest: true,
    browser: true,
  },
  root: true,
  ignorePatterns: ['**/node_modules/**'],
  rules: baseRules,
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  parserOptions: baseParserOptions,
  overrides: [
    // Typescript files only
    {
      files: ['*.ts'],
      extends: ['airbnb-base', 'plugin:@typescript-eslint/recommended-type-checked', 'plugin:prettier/recommended'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ...baseParserOptions,
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      rules: {
        ...baseRules,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-floating-promises': ['error', { ignoreIIFE: true }],
        '@typescript-eslint/restrict-template-expressions': ['error', { allowNever: true }],
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
