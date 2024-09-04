import express from 'express';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpec, swaggerUiOptions } from '../swagger';

const swaggerRouter = express.Router();

swaggerRouter.use('/', swaggerUi.serve);

swaggerRouter.route('/').get(swaggerUi.setup(swaggerSpec, swaggerUiOptions));

export default swaggerRouter;
