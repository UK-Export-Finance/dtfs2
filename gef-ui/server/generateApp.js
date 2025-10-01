const { HttpStatusCode } = require('axios');
const path = require('path');
const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { SWAGGER, create: createCsrf, verify: verifyCsrf, maintenance } = require('@ukef/dtfs2-common');
const { configure, expressSession } = require('@ukef/dtfs2-common/backend');
const routes = require('./routes');
const swaggerRouter = require('./routes/swagger.route');
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
  app.use(createCsrf);

  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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
  app.use(verifyCsrf);
  app.use('/', routes);

  // Global middlewares
  app.use((req, res) => res.status(HttpStatusCode.NotFound).render('partials/page-not-found.njk', { user: req.session.user }));
  app.use((error, req, res, next) => {
    next();

    console.error('❌ An error has occurred for request %s %o', req.url, error);
    return res.status(HttpStatusCode.BadRequest).render('partials/problem-with-service.njk', {});
  });

  return app;
};

module.exports = {
  generateApp,
};
