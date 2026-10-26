const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { webpackAliases } = require('../libs/common/src/module-aliases.cjs');

module.exports = {
  entry: {
    main: './scripts/main.js',
    govukFrontend: './scripts/govuk-frontend.js',
    jsEnabled: './scripts/js-enabled.js',
    correspondenceAddress: './scripts/correspondence-address.js',
    disableFormSubmitOnSubmission: '../libs/common/src/ui-scripts/disable-form-submit-on-submission.js',
  },
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: '[name].js',
    library: ['DTFS_GEF', '[name]'],
    libraryTarget: 'var',
  },
  target: ['web', 'es5'],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin({})],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', '.wasm'],
    // resolves paths in library files that we don't control, pointing them to the root hoisted dependencies
    alias: {
      ...webpackAliases,
      'node_modules/govuk-frontend': path.resolve(__dirname, '..', 'node_modules', 'govuk-frontend'),
      'node_modules/@ministryofjustice': path.resolve(__dirname, '..', 'node_modules', '@ministryofjustice'),
      'govuk-frontend': path.resolve(__dirname, '..', 'node_modules', 'govuk-frontend'),
      '@ministryofjustice/frontend': path.resolve(__dirname, '..', 'node_modules', '@ministryofjustice', 'frontend'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: '../css', name: 'styles.css' },
          },
          {
            loader: 'sass-loader',
            options: {
              webpackImporter: true,
              sassOptions: {
                loadPaths: [path.resolve(__dirname, '..'), path.resolve(__dirname, '../node_modules'), path.resolve(__dirname, 'node_modules')],
              },
            },
          },
        ],
      },
    ],
  },
};
