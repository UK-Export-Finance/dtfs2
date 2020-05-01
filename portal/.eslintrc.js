module.exports = {
  extends: "airbnb-base",
  env: {
    jest: true,
    browser: true,
  },
  rules: {
    'max-len': ['error', 120, 2, {
      ignoreUrls: true,
      ignoreComments: false,
      ignoreRegExpLiterals: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
    }],
    "import/no-named-as-default": 0,
    "implicit-arrow-linebreak": 0
  }
};
