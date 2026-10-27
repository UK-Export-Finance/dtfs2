import { app } from '../../server/createApp';
import { api } from '../api';

const { get } = api(app);

describe('Healthcheck', () => {
  it('should return 200 if server is healthy', async () => {
    const res = await get(`/healthcheck`);
    expect(res.body.uptime).toBeGreaterThan(0);
    expect(res.status).toEqual(200);
  });
});
