import express from 'express';
import session from 'express-session';
import morgan from 'morgan';

import path from 'path';
import routes from './routes';
import './azure-env';

import configureNunjucks from './nunjucks-configuration';
import sessionOptions from './session-configuration';

import healthcheck from './healthcheck';

const app = express();

const PORT = process.env.PORT || 5003;

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(express.urlencoded());
app.use(session(sessionOptions()));

app.use(morgan('dev', {
  // skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
  skip: (req) => req.url.startsWith('/assets'),
}));

app.use(healthcheck);
app.use('/', routes);

app.use(express.static('dist'));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/not-found', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

app.listen(PORT, () => console.log(`TFM UI app listening on port ${PORT}!`)); // eslint-disable-line no-console

export default app;
