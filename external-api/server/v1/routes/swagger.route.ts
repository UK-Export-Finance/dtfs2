import path from 'path';
import { swaggerDefinition, SWAGGER, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter } from '@ukef/dtfs2-common/swagger';

const definition: swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: SERVICES.EXTERNAL_API,
    version: '1.0.0',
    description: 'External API microservice handles all external ingress and egress network traffic.',
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Provide the external API key in the x-api-key header.',
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
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
    {
      name: 'Credit Risk Ratings',
      description: 'APIM MDM API endpoint',
    },
    {
      name: 'Obligation Subtypes',
      description: 'APIM API endpoint',
    },
  ],
};

const apis = [
  path.join(__dirname, '..', '..', SWAGGER.DEFINITIONS.PATHS.JS),
  path.join(__dirname, '..', '..', SWAGGER.DEFINITIONS.PATHS.TS),
  path.join(__dirname, '/**/*.js'),
  path.join(__dirname, '/**/*.ts'),
];

export default swaggerRouter(definition, apis);
