import path from 'path';
import { SwaggerDefinition, SWAGGER, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter as router } from '@ukef/dtfs2-common/swagger';

const definition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: SERVICES.TFM_API,
    version: '1.0.0',
    description: 'Trade finance manager API exposes endpoints for TFM collections',
  },
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'Provide the API key in the x-api-key header.',
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
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

export const swaggerRouter = router(definition, apis);
