import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import compression from 'compression';
import mongoSanitise from 'express-mongo-sanitize';
import { apiRoutes, swaggerRoutes, healthcheck } from './v1/routes';
import { seo } from './middleware/headers/seo';
import { security } from './middleware/headers/security';
import { checkApiKey } from './middleware/check-api-key';
import { createRateLimit } from './middleware/rateLimit';

dotenv.config();

const { CORS_ORIGIN } = process.env;

export const generateApp = () => {
  const app = express();

  app.use(createRateLimit());
  app.use(seo);
  app.use(security);
  app.use(healthcheck);
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

  // API documentation route
  app.use('/api-docs', swaggerRoutes);

  // all other API routes
  app.use(apiRoutes);

  return app;
};
