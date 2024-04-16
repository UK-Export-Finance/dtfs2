const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    main: './scripts/main.js',
    govukFrontend: './scripts/govuk-frontend.js',
    mojFrontend: './scripts/moj-frontend.js',
    jsEnabled: './scripts/js-enabled.js',
    disableFormOnSubmit: '../libs/common/src/ui-scripts/disableFormOnSubmit.js',
  },
  output: {
    path: path.join(__dirname, 'public/js'),
    filename: '[name].js',
    library: ['DTFS_TFM', '[name]'],
    libraryTarget: 'var',
  },
  target: ['web', 'es5'],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin(),
    ],
  },
  resolve: {
    // resolves paths in library files that we don't control, pointing them to the root hoisted dependencies
    alias: {
      'node_modules/govuk-frontend': path.resolve(__dirname, '../node_modules/govuk-frontend'),
      'node_modules/@ministryofjustice': path.resolve(__dirname, '../node_modules/@ministryofjustice'),
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
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'static/images', to: '../images' },
      ],
    }),
  ],
};
