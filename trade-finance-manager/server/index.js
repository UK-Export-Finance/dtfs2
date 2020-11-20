import express from 'express';
import morgan from 'morgan';

import path from 'path';
import routes from './routes';

import configureNunjucks from './nunjucks-configuration';

const app = express();

const PORT = process.env.PORT || 5100;

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(express.urlencoded());

app.use(morgan('dev', {
  // skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
  skip: (req) => req.url.startsWith('/assets'),
}));

app.use('/', routes);

app.use(express.static('dist'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/not-found', (req, res) => res.render('page-not-found.njk'));

app.get('*', (req, res) => res.render('page-not-found.njk'));

app.listen(PORT, () => console.log(`TFM UI app listening on port ${PORT}!`)); // eslint-disable-line no-console
