// @ts-ignore: Elastic search APM
// eslint-disable-next-line no-unused-vars
import { elasticSearchApm } from './config';

import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import compression from 'compression';
import helmet from 'helmet';

import { swaggerRoutes } from './v1/swagger-routes';
import { healthcheck } from './healthcheck';
import { apiRoutes } from './v1/routes';

// validation
import { schemas } from './validations';

dotenv.config();

// validate environment variables
const { error } = schemas.environments.validate(process.env);

if (error) {
  throw new Error(`External APIs: config validation error: ${error.message}`);
}

export const app: any = express();
app.use(express.json());
app.use(compression());
app.use(helmet());

// Return 200 on get to / to confirm to Azure that
// the container has started successfully:
const rootRouter = express.Router();
rootRouter.get('/', async (req: Request, res: Response) => {
  res.status(200).send();
});
app.use('/', rootRouter);

// API documentation route
app.use('/api-docs', swaggerRoutes);
// healthcheck route
app.use(healthcheck);
// all other API routes
app.use(apiRoutes);
