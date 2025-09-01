const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const flash = require('connect-flash');
const { HttpStatusCode } = require('axios');
const { maintenance } = require('@ukef/dtfs2-common');
const routes = require('./routes');
const { unauthenticatedLoginRoutes } = require('./routes/login');
const feedbackRoutes = require('./routes/feedback');
const configureNunjucks = require('./nunjucks-configuration');
const sessionOptions = require('./session-configuration');
const healthcheck = require('./healthcheck');
const csrfToken = require('./middleware/csrf-token.middleware');
const seo = require('./middleware/headers/seo');
const security = require('./middleware/headers/security');
const { sanitizeXss } = require('./middleware/xss-sanitizer');
const createRateLimit = require('./middleware/rateLimit/index');

const generateApp = () => {
  const app = express();
  const https = Boolean(process.env.HTTPS || 0);

  if (https) {
    app.set('trust proxy', 1);
  }

  const sessionConfiguration = sessionOptions();
  const cookie = {
    path: '/',
    httpOnly: true,
    secure: https,
    sameSite: 'strict',
    maxAge: 604800000, // 7 days
  };

  /**
   * Scheduled maintenance middleware.
   * Should always be the first middleware.
   */
  app.use(maintenance);

  app.use(seo);
  app.use(security);

  app.use(flash());

  configureNunjucks({
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  });

  app.use(
    session({
      ...sessionConfiguration,
      cookie,
    }),
  );

  app.use(cookieParser());

  app.use(compression());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    morgan('dev', {
      skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
    }),
  );

  app.use('/assets', express.static('node_modules/govuk-frontend/dist/govuk/assets'), express.static(path.join(__dirname, '..', 'public')));

  app.use(createRateLimit());

  // We add a conditional check here as there are no auth routes for the non sso journey, and
  // we cannot call app.use with './', undefined.
  if (unauthenticatedLoginRoutes) {
    app.use('/', unauthenticatedLoginRoutes);
  }

  // Unauthenticated routes
  app.use('/', feedbackRoutes);

  app.use(
    csrf({
      cookie: {
        ...cookie,
        maxAge: 43200, // 12 hours
      },
    }),
  );
  app.use(csrfToken());
  app.use(sanitizeXss());

  app.use(healthcheck);
  app.use('/', routes);

  app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));

  /**
   * Error handler configuration
   * Currently, this only handles CSRF token errors, and
   * any other errors are passed to expresses default error handler
   * https://expressjs.com/en/guide/error-handling.html
   */
  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      // handle CSRF token errors here
      console.error('Unable to verify CSRF token %o', error);
      res.status(error.statusCode || HttpStatusCode.InternalServerError);
      res.redirect('/');
    } else {
      console.error(error);
      res.status(HttpStatusCode.InternalServerError);
      res.render('_partials/problem-with-service.njk');
    }
  });

  return app;
};

module.exports = {
  generateApp,
};
