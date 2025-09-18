import path from 'path';
import { swaggerDefinition, SWAGGER, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter } from '@ukef/dtfs2-common/swagger';

const definition: swaggerDefinition = {
  info: {
    title: SERVICES.TFM_API,
    version: '1.0.0',
    description: 'Trade finance manager API exposes endpoints for TFM collections',
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

const apis = [
  path.join(__dirname, '/**/*.js'),
  path.join(__dirname, '/**/*.ts'),
  path.join(__dirname, '..', '/**/routes.js'),
  path.join(__dirname, '..', '/**/routes.ts'),
  path.join(__dirname, '..', SWAGGER.DEFINITIONS.PATHS.JS),
  path.join(__dirname, '..', SWAGGER.DEFINITIONS.PATHS.TS),
];

export default swaggerRouter(definition, apis);
