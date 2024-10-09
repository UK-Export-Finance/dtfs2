/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable import/no-extraneous-dependencies */

import { app } from '../../src/createApp';
import { api } from '../api';

const { get } = api(app);

describe('Healthcheck', () => {
  it('returns 200 if server is healthy', async () => {
    const res = await get(`/healthcheck`);
    expect(res.body.uptime).toBeGreaterThan(0);
    expect(res.status).toEqual(200);
  });
});
