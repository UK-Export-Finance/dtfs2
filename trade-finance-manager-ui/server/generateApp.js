const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const { SWAGGER, create: createCsrf, verify: verifyCsrf, maintenance, notFound, errors } = require('@ukef/dtfs2-common');
const { expressSession, configure } = require('@ukef/dtfs2-common/backend');
const routes = require('./routes');
const swaggerRouter = require('./routes/swagger.route');
const { unauthenticatedLoginRoutes } = require('./routes/login');
const feedbackRoutes = require('./routes/feedback');
const configureNunjucks = require('./nunjucks-configuration');
const healthcheck = require('./healthcheck');
const seo = require('./middleware/headers/seo');
const security = require('./middleware/headers/security');
const { sanitizeXss } = require('./middleware/xss-sanitizer');
const createRateLimit = require('./middleware/rateLimit/index');

const generateApp = () => {
  const app = express();

  // Global application configuration
  configure(app);

  app.use(seo);

  // Non-authenticated routes
  app.use(healthcheck);
  app.use(`/v1/${SWAGGER.ENDPOINTS.UI}`, swaggerRouter.default);

  app.use(security);
  app.use(expressSession());
  app.use(createCsrf);

  app.use(flash());

  configureNunjucks({
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  });

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

  /**
   * Scheduled maintenance middleware.
   * Should always be after `seo`, `security` and `assets` middlewares for UI.
   */
  app.use(maintenance);
  app.use(createRateLimit());

  app.use(verifyCsrf);
  // We add a conditional check here as there are no auth routes for the non sso journey, and
  // we cannot call app.use with './', undefined.
  if (unauthenticatedLoginRoutes) {
    app.use('/', unauthenticatedLoginRoutes);
  }
  // Unauthenticated routes
  app.use('/', feedbackRoutes);
  app.use(sanitizeXss());
  app.use('/', routes);

  /**
   * Global middlewares for edge cases
   * and gracefully handling exceptions.
   */
  // Handles all invalid URLs
  app.use(notFound('page-not-found.njk'));
  // Handles all errors and exceptions
  app.use(errors('_partials/problem-with-service.njk'));

  return app;
};

module.exports = {
  generateApp,
};
