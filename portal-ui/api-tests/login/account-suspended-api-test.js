const { createApi } = require('@ukef/dtfs2-common/api-test');
const app = require('../../server/createApp');

const { get } = createApi(app);

describe('GET /login/temporarily-suspended-access-code', () => {
  it('should render the temporarily suspended access code page with status 200', async () => {
    const response = await get('/login/temporarily-suspended-access-code');
    expect(response.status).toBe(200);
    expect(response.text).toContain('temporarily-suspended-access-code');
  });
});
