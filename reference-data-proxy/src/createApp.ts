import express from 'express';
import compression from 'compression';
import dotenv from 'dotenv';

import { swaggerRoutes } from './v1/swagger-routes';
import { healthcheck } from './healthcheck';
import { apiRoutes } from './v1/routes';

dotenv.config();

export const app: any = express();
app.use(express.json());
app.use(compression());

// API documentation route
app.use('/api-docs', swaggerRoutes);
// healthcheck route
app.use(healthcheck);
// all other API routes
app.use(apiRoutes);
