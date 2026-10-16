const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const globals = require('globals');

const tsParser = require('@typescript-eslint/parser');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const importX = require('eslint-plugin-import-x');
const noRelativeImportPaths = require('eslint-plugin-no-relative-import-paths');
const checkFile = require('eslint-plugin-check-file');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

const { rules: prettierConfigRules } = prettierConfig;

const js = require('@eslint/js');

module.exports = defineConfig([
  {
    ignores: ['**/coverage/', '**/build/', '**/.cache/', '**/dist/', '**/node_modules/', '**/package*.json'],
  },

  // Base configs
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  {
    name: 'prettier/plugin/config',
    plugins: {
      prettier: prettierPlugin,
    },
  },
  {
    name: 'prettier/config',
    rules: {
      ...prettierConfigRules,
      'prettier/prettier': 'error',
    },
  },

  // Type-checking only for TypeScript files (including tests)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
      },
    },
    rules: {
      // tsc already catches undefined identifiers/types; no-undef has false positives on TS-only constructs
      'no-undef': 'off',
    },
  },

  // JavaScript files: disable type-checking entirely
  {
    files: ['**/*.js', '**/*.cjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
    },
  },

  // Global overrides
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },

    plugins: {
      '@typescript-eslint': typescriptEslint,
      'import-x': importX,
      'no-relative-import-paths': noRelativeImportPaths,
      'check-file': checkFile,
    },

    rules: {
      curly: ['error', 'all'],
      'no-underscore-dangle': 'off',
      'class-methods-use-this': 'off',

      'no-relative-import-paths/no-relative-import-paths': ['warn', { allowSameFolder: true, rootDir: 'src', prefix: '@ukef' }],

      'no-case-declarations': 'off',

      'no-param-reassign': [
        'error',
        {
          props: true,
          ignorePropertyModificationsFor: ['req', 'res', 'session'],
        },
      ],
      'max-classes-per-file': 'off',
      'no-restricted-syntax': 'off',
      'no-await-in-loop': 'off',
      'no-new': 'off',
      'no-void': 'off',
      'padding-line-between-statements': ['error', { blankLine: 'always', prev: '*', next: 'if' }, { blankLine: 'always', prev: 'if', next: '*' }],

      'check-file/filename-naming-convention': [
        'error',
        {
          // Note that this uses a glob pattern, not a regex
          // This enforces kebab case but allows . or - to be used as a separator, and camelCase within a segment
          // This means file names such as service-name.service.test.ts and gift.facility.service-getMany.test.ts work
          '**/*': '[a-z]*([a-zA-Z0-9])*([-.]+([a-zA-Z0-9]))',
        },
      ],

      'check-file/folder-naming-convention': [
        'error',
        {
          // Note that this uses a glob pattern, not a regex
          // This enforces kebab case but allows a single _ at the front
          // and allows . or - to be used as a separator in folder names
          // This means that folder names such as dashboard.service or _macros work
          // '**/*/': '?(_)[a-z]*([a-z0-9])*([-.]+([a-z0-9]))',
        },
      ],

      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      'no-unused-vars': 'off', // superseded by the TS-aware rule below (base rule doesn't understand ignoreRestSiblings)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true, caughtErrors: 'none' }],
      '@typescript-eslint/naming-convention': [
        'error',
        // DTFS exception
        // Why: Allow the exact variable identifier "_id" (MongoDB)
        {
          selector: 'variable',
          filter: {
            regex: '^_id$',
            match: true,
          },
          format: null,
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      '@typescript-eslint/method-signature-style': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/return-await': ['error', 'always'],

      'import-x/no-namespace': 'off',
      'import-x/namespace': ['error', { allowComputed: true }],
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.{js,ts}',
            '**/*.tests.ts',
            '**/*.api-test{s,}.{js,ts}',
            '**/__mocks__/**',
            'api-tests/**',
            'test-helpers/**',
            'eslint.config.cjs',
          ],
        },
      ],
      'import-x/prefer-default-export': 'off',
      'import-x/no-default-export': 'error',

      'import-x/order': [
        'error',
        {
          groups: [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'import-x/consistent-type-specifier-style': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'off',
      'import-x/no-useless-path-segments': 'off',
    },
  },

  // JavaScript files: re-disable typed rules that "Global overrides" re-enables for all files.
  // Must stay last so it wins over "Global overrides" for the same rule/file combination.
  {
    files: ['**/*.js', '**/*.cjs'],

    rules: {
      '@typescript-eslint/return-await': 'off',
    },
  },

  // jest.config.ts must have a default export - that's how Jest loads it
  {
    files: ['**/jest.config.ts'],

    rules: {
      'import-x/no-default-export': 'off',
    },
  },
]);
