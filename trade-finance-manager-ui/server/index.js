const express = require('express');
const compression = require('compression');
const session = require('express-session');
const morgan = require('morgan');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const path = require('path');
const routes = require('./routes');
require('./azure-env');

const configureNunjucks = require('./nunjucks-configuration');
const sessionOptions = require('./session-configuration');
const healthcheck = require('./healthcheck');
const csrfToken = require('./middleware/csrf-token.middleware');

const app = express();

// Global middleware set headers
app.use((req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');
  next();
});

app.use(helmet({ contentSecurityPolicy: false }));

const PORT = process.env.PORT || 5003;

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(session(sessionOptions()));
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(csrf({ cookie: true }));
app.use(csrfToken());

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

app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));
// error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    // handle CSRF token errors here
    res.status(err.statusCode || 500);
    res.redirect('/');
  } else {
    next(err);
  }
});

app.listen(PORT, () => console.info(`TFM UI app listening on port ${PORT}!`));
