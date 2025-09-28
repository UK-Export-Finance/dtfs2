const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { SWAGGER, maintenance } = require('@ukef/dtfs2-common');
const { configure, expressSession } = require('@ukef/dtfs2-common/backend');
const routes = require('./routes');
const swaggerRouter = require('./routes/swagger.route');
const supportingInformationUploadRoutes = require('./routes/supporting-information-upload');
const healthcheck = require('./healthcheck');
const configureNunjucks = require('./nunjucks-configuration');
const { security, seo, createRateLimit } = require('./middleware');

dotenv.config();

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

  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // These routes cannot use the csrf check below so must come before it
  // They implement their own separate csrf check
  app.use('/', supportingInformationUploadRoutes);

  app.use(flash());

  configureNunjucks({
    autoescape: true,
    express: app,
    noCache: true,
    watch: true,
  });

  app.use(
    morgan('dev', {
      skip: (req) => req.url.startsWith('/assets') || req.url.startsWith('/main.js'),
    }),
  );

  app.use('/assets', express.static(path.join(__dirname, '..', 'public')));

  /**
   * Scheduled maintenance middleware.
   * Should always be after `seo`, `security` and `assets` middlewares for UI.
   */
  app.use(maintenance);

  app.use(createRateLimit());

  app.use('/', routes);

  // eslint-disable-next-line no-unused-vars
  app.use((error, req, res, next) => {
    if (error.code === 'EBADCSRFTOKEN') {
      // handle CSRF token errors here
      res.status(error.statusCode || 500);
      res.redirect('/');
    } else {
      res.render('partials/problem-with-service.njk', { user: req.session.user, error });
    }
  });

  app.use((req, res) => res.status(404).render('partials/page-not-found.njk', { user: req.session.user }));
  return app;
};

module.exports = {
  generateApp,
};
