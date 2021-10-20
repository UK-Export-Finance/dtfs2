const express = require('express');
const compression = require('compression');
const session = require('express-session');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');

const path = require('path');
const routes = require('./routes');
require('./azure-env');

const configureNunjucks = require('./nunjucks-configuration');
const sessionOptions = require('./session-configuration');

const healthcheck = require('./healthcheck');
const { validateEnv } = require('./helpers/validateEnv');

validateEnv();

dotenv.config();
const app = express();
app.use(helmet());

const { PORT } = process.env;

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(express.urlencoded());
app.use(session(sessionOptions()));
app.use(compression());

app.use(morgan('dev', {
  skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
}));

app.use(healthcheck);
app.use('/', routes);

app.use(
  '/assets',
  express.static(path.join(__dirname, '..', 'node_modules', 'govuk-frontend', 'govuk', 'assets')),
  express.static(path.join(__dirname, '..', 'public')),
);

app.get('/not-found', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

app.listen(PORT, () => console.log(`TFM UI app listening on port ${PORT}!`)); // eslint-disable-line no-console
