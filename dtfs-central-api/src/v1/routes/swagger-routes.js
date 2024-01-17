const express = require('express');
const swaggerUi = require('swagger-ui-express');

const swaggerRouter = express.Router();

const { swaggerSpec, swaggerUiOptions } = require('../swagger');

swaggerRouter.use('/', swaggerUi.serve);

swaggerRouter.route('/').get(swaggerUi.setup(swaggerSpec, swaggerUiOptions));

module.exports = swaggerRouter;
