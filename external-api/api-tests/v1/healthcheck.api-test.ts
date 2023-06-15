import { app } from '../../src/createApp';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { get } = require('../api')(app);

describe('Healthcheck', () => {
  it('returns 200 if server is healthy', async () => {
    const res = await get(`/healthcheck`, null);
    expect(res.body.uptime).toBeGreaterThan(0);
    expect(res.status).toBe(200);
  });
});
