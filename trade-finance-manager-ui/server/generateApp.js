const path = require('path');
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const { getUnauthenticatedAuthRouter } = require('./routes/auth/configs');
const routes = require('./routes');
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

  app.use(seo);
  app.use(security);

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
  app.use(compression());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Unauthenticated routes
  app.use('/', feedbackRoutes);
  // We add a conditional check here as there are no auth routes for the non sso journey, and
  // we cannot call app.use with './', undefined.
  const unauthenticatedAuthRouters = getUnauthenticatedAuthRouter();

  if (unauthenticatedAuthRouters) {
    app.use(unauthenticatedAuthRouters);
  }
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

  app.use(
    morgan('dev', {
      skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
    }),
  );

  app.use('/assets', express.static('node_modules/govuk-frontend/govuk/assets'), express.static(path.join(__dirname, '..', 'public')));

  app.use(createRateLimit());
  app.use(healthcheck);
  app.use('/', routes);

  app.get('*', (req, res) => res.render('page-not-found.njk', { user: req.session.user }));
  // error handler
  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      // handle CSRF token errors here
      res.status(error.statusCode || 500);
      res.redirect('/');
    } else {
      next(error);
    }
  });

  return app;
};

module.exports = {
  generateApp,
};
