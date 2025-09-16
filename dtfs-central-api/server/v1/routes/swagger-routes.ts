import path from 'path';
import { swaggerRouter, SERVICES } from '@ukef/dtfs2-common';

const definition = {
  info: {
    title: SERVICES.CENTRAL_API,
    version: '1.0.0',
    description:
      'Central API handles all I/O operations from other API microservices. All DB and Files storage API calls should be written in central API microservice.',
  },
  tags: [
    {
      name: 'Bank',
      description: 'Get and create banks. This is only used in the central API.',
    },
    {
      name: 'Portal - BSS',
      description: 'Get and update BSS deals and facilities. Consumed by Portal and TFM.',
    },
    {
      name: 'Portal - GEF',
      description: 'Get and update GEF deals, facilities and exporters. Consumed by TFM.',
    },
    {
      name: 'TFM',
      description: 'Create, get and update TFM deals, facilities, users and teams. Consumed by TFM (excluding the /submit endpoint which Portal calls).',
    },
    {
      name: 'User',
      description: 'Get and create Portal (BSS/GEF) users. This is only used in the central API.',
    },
    {
      name: 'Utilisation Report',
      description: 'Get, create and update utilisation reports. Consumed by PORTAL and TFM.',
    },
  ],
};

const apis = [path.join(__dirname, '..', '/swagger-definitions/**/*.js'), path.join(__dirname, '/**/*.js')];

export default swaggerRouter(definition, apis);
