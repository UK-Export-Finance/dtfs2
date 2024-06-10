const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

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
    {
      name: 'Utilisation Report',
      description: 'Get, create and update utilisation reports. Consumed by PORTAL and TFM.',
    },
  ],
};

const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [path.join(__dirname, 'swagger-definitions/**/*.js'), path.join(__dirname, 'routes/*.js')],
});

const swaggerUiOptions = {
  // explorer: true,
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions,
};
