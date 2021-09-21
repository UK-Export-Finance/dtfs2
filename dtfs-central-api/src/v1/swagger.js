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
      description: 'Get and create banks. This is only used in the central API.',
    },
    {
      name: 'Portal',
      description: 'Get and update BSS and GEF deals and facilities. Consumed by TFM and Portal.',
    },
    {
      name: 'TFM',
      description: 'Create, get and update TFM deals, facilities, users and teams. Consumed by TFM (excluding the /submit endpoint which Portal calls).',
    },
    {
      name: 'User',
      description: 'Get and create Portal (BSS/GEF) users. This is only used in the central API.',
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
