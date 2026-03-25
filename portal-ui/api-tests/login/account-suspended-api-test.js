import { createApi } from '@ukef/dtfs2-common/api-test';
import { HttpStatusCode } from 'axios';
import app from '../../server/createApp';

const { get } = createApi(app);

describe('GET /login/temporarily-suspended-access-code', () => {
  it('should render the temporarily suspended access code page with status OK', async () => {
    const response = await get('/login/temporarily-suspended-access-code');

    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.text).toContain('temporarily-suspended-access-code');
  });
});
