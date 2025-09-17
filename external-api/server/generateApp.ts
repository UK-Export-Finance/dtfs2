import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import compression from 'compression';
import mongoSanitise from 'express-mongo-sanitize';
import { maintenance, SWAGGER } from '@ukef/dtfs2-common';
import { apiRoutes, swaggerRoutes, healthcheck } from './v1/routes';
import { seo } from './middleware/headers/seo';
import { security } from './middleware/headers/security';
import { checkApiKey } from './middleware/check-api-key';
import { createRateLimit } from './middleware/rateLimit';

dotenv.config();

const { CORS_ORIGIN } = process.env;

export const generateApp = () => {
  const app = express();

  app.use(seo);

  // Non-authenticated routes
  app.use(healthcheck);
  app.use(`/v1/${SWAGGER.ENDPOINTS.UI}`, swaggerRoutes.default);

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
