import path from 'path';
import { swaggerRouter, SERVICES } from '@ukef/dtfs2-common';

const definition = {
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
