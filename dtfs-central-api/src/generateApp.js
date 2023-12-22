const express = require('express');
const compression = require('compression');
const mongoSanitise = require('express-mongo-sanitize');
const { seo, security, checkApiKey, createRateLimit } = require('./v1/routes/middleware');

const { BANK_ROUTE, PORTAL_ROUTE, TFM_ROUTE, USER_ROUTE, UTILISATION_REPORTS_ROUTE, SWAGGER_ROUTE } = require('./constants/routes');

const healthcheck = require('./healthcheck');

const { bankRoutes, portalRoutes, tfmRoutes, userRoutes, utilisationReportsRoutes, swaggerRoutes } = require('./v1/routes');
const removeCsrfToken = require('./v1/routes/middleware/remove-csrf-token');

const generateApp = () => {
  const app = express();

  app.use(seo);
  app.use(security);
  app.use(healthcheck);
  app.use(checkApiKey);
  // added limit for larger payloads - 500kb
  app.use(express.json({ limit: '500kb' }));
  app.use(compression());
  app.use(removeCsrfToken);
  app.use(createRateLimit());
  // MongoDB sanitisation
  app.use(
    mongoSanitise({
      allowDots: true,
    }),
  );

  app.use(`/v1/${BANK_ROUTE}`, bankRoutes);
  app.use(`/v1/${PORTAL_ROUTE}`, portalRoutes);
  app.use(`/v1/${TFM_ROUTE}`, tfmRoutes);
  app.use(`/v1/${USER_ROUTE}`, userRoutes);
  app.use(`/v1/${UTILISATION_REPORTS_ROUTE}`, utilisationReportsRoutes);
  app.use(`/v1/${SWAGGER_ROUTE}`, swaggerRoutes);

  // Return 200 on get to / to confirm to Azure that
  // the container has started successfully:
  const rootRouter = express.Router();
  rootRouter.get('/', async (req, res) => {
    res.status(200).send();
  });

  app.use('/', rootRouter);

  return app;
};

module.exports = { generateApp };
