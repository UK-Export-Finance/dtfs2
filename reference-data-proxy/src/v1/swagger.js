const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Reference Data Proxy API',
    version: '1.0.0',
    description: 'TODO',
  },
  tags: [
  ],
};
const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: [
    './src/v1/swagger-definitions/*.js',
    './src/v1/routes/*.js',
  ],
});

const swaggerUiOptions = {};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
