import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from '../../utils';

export const swaggerRoutes = express.Router();
swaggerRoutes.use('/', swaggerUi.serve);
swaggerRoutes.route('/').get(swaggerUi.setup(swaggerSpec, swaggerUiOptions));
