const express = require('express');
const morgan = require('morgan');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');
require('./azure-env');
const routes = require('./routes');
const eligibilityRoutes = require('./routes/contract/eligibility');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { csrf: csrfToken, seo, security } = require('./routes/middleware');
const sessionOptions = require('./session-configuration');

const app = express();
const PORT = process.env.PORT || 5000;
const https = Boolean(process.env.HTTPS || 0);

if (https) {
  app.set('trust proxy', 1);
}

const cookie = {
  path: '/',
  httpOnly: true,
  secure: https,
  sameSite: 'strict',
  maxAge: 604800000, // 7 days
};

app.use(seo);
app.use(security);

if (!process.env.SESSION_SECRET) {
  console.error('Portal UI server - SESSION_SECRET missing');
}

const sessionConfiguration = sessionOptions();
app.use(session({ ...sessionConfiguration, cookie }));

app.use(flash());

configureNunjucks({
  autoescape: true,
  express: app,
  noCache: true,
  watch: true,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/', eligibilityRoutes);
app.use(csrf({
  cookie: {
    ...cookie,
    maxAge: 43200, // 12 hours
  },
}));
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

app.listen(PORT, () => console.info(`BSS: Listening on port ${PORT}!`));
