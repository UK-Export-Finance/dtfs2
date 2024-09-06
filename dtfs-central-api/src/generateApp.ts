import express, { Express } from 'express';
import compression from 'compression';
import mongoSanitise from 'express-mongo-sanitize';
import { MAX_REQUEST_SIZE } from '@ukef/dtfs2-common';
import { seo, security, checkApiKey, createRateLimit } from './v1/routes/middleware';

import { ROUTES } from './constants';

import healthcheck from './healthcheck';

import { bankRoutes, portalRoutes, tfmRoutes, userRoutes, utilisationReportsRoutes, swaggerRoutes } from './v1/routes';
import removeCsrfToken from './v1/routes/middleware/remove-csrf-token';

const { BANK_ROUTE, PORTAL_ROUTE, TFM_ROUTE, USER_ROUTE, UTILISATION_REPORTS_ROUTE, SWAGGER_ROUTE } = ROUTES;

export const generateApp = (): Express => {
  const app = express();

  app.use(`/v1/${SWAGGER_ROUTE}`, swaggerRoutes);

  app.use(seo);
  app.use(security);
  app.use(healthcheck);
  app.use(checkApiKey);
  // added limit for larger payloads
  app.use(express.json({ limit: MAX_REQUEST_SIZE }));
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

  // Return 200 on get to / to confirm to Azure that
  // the container has started successfully:
  const rootRouter = express.Router();
  rootRouter.get('/', (req, res) => {
    res.status(200).send();
  });

  app.use('/', rootRouter);

  return app;
};
