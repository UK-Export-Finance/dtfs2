import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Reference Data Proxy API',
    version: '1.0.0',
    description:
      'API to call external APIs and handle requests/responses. To see the Mulesoft endpoints we consume, see the "External APIs we call" page in Confluence. This API also contains some local data instead of integrating with an API.',
  },
  tags: [
    {
      name: 'Local Data',
      description: 'Reference data that is stored locally. No external APIs consumed.',
    },
    {
      name: 'Countries',
      description: 'Locally stored data',
    },
    {
      name: 'Currencies',
      description: 'Locally stored data',
    },
    {
      name: 'Industry Sectors',
      description: 'Locally stored data',
    },
    {
      name: 'Mulesoft',
      description: 'UKEF APIs',
    },
    {
      name: 'ACBS',
      description: 'Mulesoft API endpoints',
    },
    {
      name: 'Number Generator',
      description: 'Triggers calls to Mulesoft API endpoints',
    },
    {
      name: 'PartyDB',
      description: 'Mulesoft API endpoints',
    },
    {
      name: 'Currency Exchange',
      description: 'Mulesoft API endpoint',
    },
    {
      name: 'Exposure Period',
      description: 'Mulesoft API endpoint',
    },
    {
      name: 'Premium Schedule',
      description: 'Mulesoft API endpoints',
    },
    {
      name: 'Estore',
      description: 'Mulesoft API endpoints',
    },
    {
      name: 'Companies House',
      description: 'Public API',
    },
    {
      name: 'Ordnance Survey',
      description: 'Public API',
    },
    {
      name: 'Notify',
      description: 'GOV.UK API',
    },
  ],
};

export const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./src/v1/helpers/swagger-definitions/*.ts', './src/v1/routes/external-apis.route.ts'],
});

export const swaggerUiOptions = {};
