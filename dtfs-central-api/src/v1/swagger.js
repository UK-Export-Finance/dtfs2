const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Central API',
    version: '1.0.0',
    description: 'TODO',
  },
  tags: [
    {
      name: 'Bank',
      description: '',
    },
    {
      name: 'Portal',
      description: '',
    },
    {
      name: 'TFM',
      description: '',
    },
    {
      name: 'User',
      description: '',
    },
  ],
};
const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./src/v1/routes/*.js'],
});

const swaggerUiOptions = {
  // explorer: true,
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
