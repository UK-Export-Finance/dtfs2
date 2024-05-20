const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Central API',
    version: '1.0.0',
    description: 'API to handle submissions, getting and updating data from one API to another API. (Portal > Central > TFM and vice versa) ',
  },
  tags: [
    {
      name: 'Bank',
      description: 'Get and create banks. This is only used in the central API.',
    },
    {
      name: 'Portal - BSS',
      description: 'Get and update BSS deals and facilities. Consumed by Portal and TFM.',
    },
    {
      name: 'Portal - GEF',
      description: 'Get and update GEF deals, facilities and exporters. Consumed by TFM.',
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
  apis: ['./src/v1/swagger-definitions/*.js', './src/v1/swagger-definitions/*/*.js', './src/v1/routes/*.js'],
});

const swaggerUiOptions = {
  // explorer: true,
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
