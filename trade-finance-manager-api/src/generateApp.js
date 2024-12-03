const express = require('express');
const passport = require('passport');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const mongoSanitise = require('express-mongo-sanitize');
const { initialiseCronJobScheduler } = require('@ukef/dtfs2-common');
const { validateSsoFeatureFlagIsOff } = require('./v1/middleware/validate-sso-feature-flag');
const healthcheck = require('./healthcheck');
const { authRouter, openRouter } = require('./v1/routes');
const loginController = require('./v1/controllers/user/user.routes');
const seo = require('./v1/middleware/headers/seo');
const security = require('./v1/middleware/headers/security');
const removeCsrfToken = require('./v1/middleware/remove-csrf-token');
const configurePassport = require('./v1/controllers/user/passport');
const createRateLimit = require('./v1/middleware/rateLimit/index');
const { cronSchedulerJobs } = require('./cron-scheduler-jobs');

initialiseCronJobScheduler(cronSchedulerJobs);

configurePassport(passport);

const generateApp = () => {
  const app = express();

  app.use(createRateLimit());
  app.use(seo);
  app.use(security);
  app.use(express.json());
  app.use(compression());
  app.use(removeCsrfToken);
  app.use(healthcheck);
  app.use(passport.initialize());
  app.post('/v1/login', validateSsoFeatureFlagIsOff, loginController.login);
  app.use('/v1', openRouter);
  app.use('/v1', authRouter);

  // MongoDB sanitisation
  app.use(
    mongoSanitise({
      allowDots: true,
    }),
  );

  // Return 200 on get to / to confirm to Azure that
  // the container has started successfully:
  const rootRouter = express.Router();
  rootRouter.get('/', (req, res) => {
    res.status(200).send();
  });

  rootRouter.use('/v1/api-docs', swaggerUi.serve);

  app.use('/', rootRouter);

  return app;
};

module.exports = {
  generateApp,
};
