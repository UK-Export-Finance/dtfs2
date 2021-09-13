module.exports = {
  extends: ['airbnb-base', 'plugin:cypress/recommended'],
  env: {
    'cypress/globals': true,
    jest: true,
    browser: true,
  },
  plugins: ['cypress'],
  rules: {
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'import/no-named-as-default': 0,
    'implicit-arrow-linebreak': 0,
    "import/no-extraneous-dependencies": ["error", {"devDependencies": false}]
  }
};
