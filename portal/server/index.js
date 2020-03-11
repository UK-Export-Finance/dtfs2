import express from 'express'
import path from 'path'
import nunjucks from 'nunjucks'
import routes from './routes'

// var webpack = require('webpack');
// var webpackConfig = require('../webpack.dev.config');
// var compiler = webpack(webpackConfig);

const app = express()

const HOST = '0.0.0.0';
const PORT = process.env.PORT || 5000

nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  noCache: true,
  watch: true
});

// app.use(require("webpack-dev-middleware")(compiler, {
//     noInfo: true,
//     publicPath: webpackConfig.output.publicPath
// }));
//
// app.use(require("webpack-hot-middleware")(compiler));

app.use('/', routes);

app.use(express.static('dist'))

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.get('*', (req, res) => res.render('page-not-found.njk'))

app.listen(PORT, () => console.log(`DTFS2 app listening on port ${PORT}!`))
