import path from 'path';
import { swaggerDefinition, SWAGGER, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter } from '@ukef/dtfs2-common/swagger';

const definition: swaggerDefinition = {
  info: {
    title: SERVICES.TFM_UI,
    version: '1.0.0',
    description: 'TFM UI microservice endpoints for TFM UI operations',
  },
  tags: [],
};

const apis = [
  path.join(__dirname, '..', SWAGGER.DEFINITIONS.PATHS.JS),
  path.join(__dirname, '..', SWAGGER.DEFINITIONS.PATHS.TS),
  path.join(__dirname, '/**/*.js'),
  path.join(__dirname, '/**/*.ts'),
];

export default swaggerRouter(definition, apis);
