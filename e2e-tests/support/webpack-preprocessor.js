const path = require('node:path');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const batteriesIncludedPreprocessor = require('@cypress/webpack-batteries-included-preprocessor');
const { webpackAliases } = require('../../libs/common/src/module-aliases.cjs');

const createWebpackPreprocessor = () => {
  const webpackOptions = batteriesIncludedPreprocessor.getFullWebpackOptions();

  webpackOptions.resolve.alias = {
    ...webpackOptions.resolve.alias,
    ...webpackAliases,
  };

  webpackOptions.resolve.extensions.push('.ts', '.tsx');
  webpackOptions.module.rules.push({
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: {
      loader: require.resolve('ts-loader'),
      options: {
        configFile: path.resolve(__dirname, '../../libs/common/tsconfig.json'),
        transpileOnly: true,
      },
    },
  });

  return webpackPreprocessor({ webpackOptions });
};

module.exports = { createWebpackPreprocessor };
