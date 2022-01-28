module.exports = {
    extends: "airbnb-base",
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
      "no-underscore-dangle": ['error', { allow: ['_id'] }],
      "import/no-named-as-default": 0,
      "implicit-arrow-linebreak": 0,
      'no-console': 'off',
    }
  };
  
