import path from 'path';
import { swaggerDefinition, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter } from '@ukef/dtfs2-common/swagger';

const definition: swaggerDefinition = {
  info: {
    title: SERVICES.EXTERNAL_API,
    version: '1.0.0',
    description: 'External API microservice handles all external ingress and egress network traffic.',
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

const apis = [
  path.join(__dirname, '..', '..', '/helpers/swagger-definitions/**/*.js'),
  path.join(__dirname, '..', '..', '/helpers/swagger-definitions/**/*.ts'),
  path.join(__dirname, '/**/*.js'),
  path.join(__dirname, '/**/*.ts'),
];

export default swaggerRouter(definition, apis);
