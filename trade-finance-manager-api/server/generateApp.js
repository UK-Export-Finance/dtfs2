const express = require('express');
const passport = require('passport');
const compression = require('compression');
const axios = require('axios');
const { exceptionHandlers, initialiseCronJobScheduler, sanitiseMongoRequest, xss, removePasswordFromError } = require('@ukef/dtfs2-common');
const { maintenance, SWAGGER } = require('@ukef/dtfs2-common');

const { validateSsoFeatureFlagFalse } = require('./v1/middleware/validate-sso-feature-flag');
const healthcheck = require('./healthcheck');
const { authRouter, openRouter } = require('./v1/routes');
const swaggerRouter = require('./v1/routes/swagger.route');
const loginController = require('./v1/controllers/user/user.routes');
const seo = require('./v1/middleware/headers/seo');
const security = require('./v1/middleware/headers/security');
const removeCsrfToken = require('./v1/middleware/remove-csrf-token');
const configurePassport = require('./v1/controllers/user/passport');
const createRateLimit = require('./v1/middleware/rateLimit/index');
const { cronSchedulerJobs } = require('./cron-scheduler-jobs');

initialiseCronJobScheduler(cronSchedulerJobs);

configurePassport(passport);

/**
 * Middleware to remove password from any error
 * Outside generateApp to ensure it is run once only,
 * and not multiple times if generateApp is called multiple times (e.g. in tests).
 */
removePasswordFromError(axios);

const generateApp = () => {
  const app = express();

  /**
   * Express 5 now uses simple query parser by default, which does not support nested query params.
   * We need to set the query parser to 'extended' to support nested query params,
   * such as sortBy[field]=... into objects.
   */
  app.set('query parser', 'extended');

  // Register global handlers
  exceptionHandlers();

  app.use(seo);

  // Non-authenticated routes
  app.use(healthcheck);
  app.use(`/v1/${SWAGGER.ENDPOINTS.UI}`, swaggerRouter.default);

  app.use(security);

  /**
   * Scheduled maintenance middleware.
   * Should always be after `seo` and `security` middlewares.
   */
  app.use(maintenance);

  app.use(createRateLimit());
  app.use(express.json());
  app.use(compression());
  app.use(removeCsrfToken);
  app.use(xss);
  app.use(passport.initialize());

  // MongoDB sanitisation
  app.use(sanitiseMongoRequest);

  app.post('/v1/login', validateSsoFeatureFlagFalse, loginController.login);
  app.use('/v1', openRouter);
  app.use('/v1', authRouter);

  // Return 200 on get to / to confirm to Azure that
  // the container has started successfully:
  const rootRouter = express.Router();
  rootRouter.get('/', (req, res) => {
    res.status(200).send();
  });

  app.use('/', rootRouter);

  return app;
};

module.exports = {
  generateApp,
};
