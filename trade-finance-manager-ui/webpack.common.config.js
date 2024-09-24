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
    disableFormSubmitOnSubmission: '../libs/common/src/ui-scripts/disable-form-submit-on-submission.js',
    enableSelectAllTableCheckbox: './scripts/enable-select-all-table-checkbox.js',
    enableFindReportsByYearDropdown: './scripts/enable-find-reports-by-year-dropdown.ts',
    mojFilterHide: './scripts/moj-filter-hide.ts',
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
    minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
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
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
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
      patterns: [{ from: 'static/images', to: '../images' }],
    }),
  ],
};
