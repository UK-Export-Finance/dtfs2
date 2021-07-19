const path = require('path');
const globEntries = require('webpack-glob-entries');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

// Webpack doesn't support glob paths. For the nunjucks-html-loader,
// we need each path to be specified for it to work (even subdirectories)
function returnEntries(globPath) {
  const entries = globEntries(globPath, true);
  const folderList = new Array();
  for (const folder in entries) {
    folderList.push(path.join(__dirname, entries[folder]));
  }
  return folderList;
}

module.exports = {
  entry: {
    main: './scripts/main.js',
    govukFrontend: './scripts/govuk-frontend.js',
    mojFrontend: './scripts/moj-frontend.js',
    maskedInputs: './scripts/masked-inputs.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
    library: ['DTFS', '[name]'],
    libraryTarget: 'var',
  },
  target: ['web', 'es5'],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new OptimizeCSSAssetsPlugin({}),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
            ],
          },
        },
      },
      {
        test: /\.html$|njk|nunjucks/,
        use: ['html-loader', {
          loader: 'nunjucks-html-loader',
          options: {
            // base directory in which webpack is going to find any .njk files
            searchPaths: [...returnEntries('./templates/**/')],
          },
        }],
      },
      {
        test: /\.(s*)css$/,
        use: [
          {
            loader: 'file-loader',
            options: { outputPath: '/', name: 'styles.css' },
          },
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({
      filename: 'index.html',
      inject: 'body',
      // tell webpack to pass index.njk through the nunjucks-html-loader
      template: 'nunjucks-html-loader!./templates/index.njk',
    }),
    new CopyPlugin({
      patterns: [
        { from: './node_modules/govuk-frontend/govuk/assets', to: './assets' },
        { from: './static/images', to: './assets/images' },
        { from: './static/*', flatten: true },
      ],
    }),
  ],
};
