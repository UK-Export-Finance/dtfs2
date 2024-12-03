const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Trade Finance Manager API',
    version: '1.0.0',
    description: 'Consumes deals and integrates with external APIs',
  },
  tags: [
    {
      name: 'Deals',
      description: '',
    },
    {
      name: 'Users',
      description: '',
    },
  ],
};
const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./src/v1/**/routes.js'],
});

const swaggerUiOptions = {
  // explorer: true,
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
