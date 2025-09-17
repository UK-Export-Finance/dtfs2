import path from 'path';
import { swaggerRouter, SERVICES } from '@ukef/dtfs2-common';

const definition = {
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
];

export default swaggerRouter(definition, apis);
