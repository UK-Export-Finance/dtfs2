const path = require('path');

module.exports = {
  entry: {
    main: './src/scripts/main.js',
    govukFrontend: './src/scripts/govuk-frontend.js',
    mojFrontend: './src/scripts/moj-frontend.js',
    maskedInputs: './src/scripts/masked-inputs.js',
  },
  output: {
    path: path.resolve(__dirname, 'src/public/js'),
    filename: '[name].js',
  },
  target: 'web',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
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
};
