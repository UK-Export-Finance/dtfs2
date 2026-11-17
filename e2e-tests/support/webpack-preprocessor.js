const path = require('node:path');
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const batteriesIncludedPreprocessor = require('@cypress/webpack-batteries-included-preprocessor');
const { webpackAliases } = require('../../libs/common/src/module-aliases.cjs');

const utilsRoot = path.resolve(__dirname, '../../utils');

const createWebpackPreprocessor = () => {
  const webpackOptions = batteriesIncludedPreprocessor.getFullWebpackOptions();

  webpackOptions.resolve.alias = {
    ...webpackOptions.resolve.alias,
    ...webpackAliases,
  };

  /**
   * Allow utils' own baseUrl-relative imports (e.g. 'mock-data-loader/banks',
   * 'drivers/db-client') to resolve the same way they do for TypeScript
   * compilation and ts-node at runtime (see utils/tsconfig.json `baseUrl`
   * and utils/register-paths.cjs). This is set explicitly rather than relying
   * on the batteries-included preprocessor's own tsconfig auto-detection.
   */
  webpackOptions.resolve.modules = [...(webpackOptions.resolve.modules ?? ['node_modules']), utilsRoot];

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
