import path from 'path';
import { swaggerDefinition, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter } from '@ukef/dtfs2-common/swagger';

const definition: swaggerDefinition = {
  info: {
    title: SERVICES.PORTAL_API,
    version: '1.0.0',
    description: 'Portal API microservice exposes API for portal-ui and gef-ui microservices.',
  },
  tags: [],
};

const apis = [
  path.join(__dirname, '..', '..', '/helpers/swagger-definitions/**/*.js'),
  path.join(__dirname, '..', '..', '/helpers/swagger-definitions/**/*.ts'),
  path.join(__dirname, '..', '/**/routes.js'),
  path.join(__dirname, '..', '/**/routes.ts'),
  path.join(__dirname, '/**/*.js'),
  path.join(__dirname, '/**/*.ts'),
];

export default swaggerRouter(definition, apis);
