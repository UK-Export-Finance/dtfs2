import path from 'path';
import { swaggerDefinition, SERVICES } from '@ukef/dtfs2-common';
import { swaggerRouter } from '@ukef/dtfs2-common/swagger';

const definition: swaggerDefinition = {
  info: {
    title: SERVICES.PORTAL_UI,
    version: '1.0.0',
    description: 'Portal UI microservice endpoints for BSS/EWCS UI operations',
  },
  tags: [],
};

const apis = [
  path.join(__dirname, '..', '/swagger-definitions/**/*.js'),
  path.join(__dirname, '..', '/swagger-definitions/**/*.ts'),
  path.join(__dirname, '/**/*.js'),
  path.join(__dirname, '/**/*.ts'),
];

export default swaggerRouter(definition, apis);
