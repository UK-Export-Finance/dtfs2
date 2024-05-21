import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'External API API',
    version: '1.0.0',
    description:
      'API to call external APIs and handle requests/responses. To see the APIM endpoints we consume, see the "External APIs we call" page in Confluence. This API also contains some local data instead of integrating with an API.',
  },
  tags: [
    {
      name: 'Local Data',
      description: 'External API that is stored locally. No external APIs consumed.',
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
      name: 'APIM',
      description: 'UKEF APIs',
    },
    {
      name: 'ACBS',
      description: 'APIM API endpoints',
    },
    {
      name: 'Number Generator',
      description: 'APIM API endpoints',
    },
    {
      name: 'PartyDB',
      description: 'APIM API endpoints',
    },
    {
      name: 'Currency Exchange',
      description: 'APIM API endpoint',
    },
    {
      name: 'Exposure Period',
      description: 'APIM API endpoint',
    },
    {
      name: 'Premium Schedule',
      description: 'APIM API endpoints',
    },
    {
      name: 'Estore',
      description: 'APIM API endpoints',
    },
    {
      name: 'Companies House',
      description: 'Public API',
    },
    {
      name: 'Geospatial Addresses',
      description: 'APIM API endpoints',
    },
    {
      name: 'Notify',
      description: 'GOV.UK API',
    },
    {
      name: 'Bank Holidays',
      description: 'GOV.UK API and locally stored backup data',
    },
  ],
};

export const swaggerSpec = swaggerJsdoc({
  swaggerDefinition,
  apis: ['./src/v1/helpers/swagger-definitions/*.ts', './src/v1/routes/external-apis.route.ts'],
});

export const swaggerUiOptions = {};
