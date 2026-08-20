import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import compression from 'compression';
import mongoSanitise from 'express-mongo-sanitize';
import axios from 'axios';
import { exceptionHandlers, maintenance, SWAGGER, xss, removePasswordFromError } from '@ukef/dtfs2-common';

import { apiRoutes, swaggerRouter, healthcheck } from './v1/routes';
import { seo } from './middleware/headers/seo';
import { security } from './middleware/headers/security';
import { checkApiKey } from './middleware/check-api-key';
import { createRateLimit } from './middleware/rateLimit';

dotenv.config();

const { CORS_ORIGIN } = process.env;

/**
 * Middleware to remove password from any error
 * Outside generateApp to ensure it is run once only,
 * and not multiple times if generateApp is called multiple times (e.g. in tests).
 */
removePasswordFromError(axios);

export const generateApp = () => {
  const app = express();

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
  app.use(checkApiKey);
  app.use(xss);

  // MongoDB sanitisation
  app.use(
    mongoSanitise({
      allowDots: true,
    }),
  );

  app.use(
    cors({
      origin: CORS_ORIGIN,
      allowedHeaders: ['Content-Type', 'x-api-key'],
    }),
  );

  // all other API routes
  app.use(apiRoutes);

  return app;
};
