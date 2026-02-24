import { createApi } from '@ukef/dtfs2-common/api-test';
import { HttpStatusCode } from 'axios';
import app from '../../server/createApp';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/routes/middleware/validatePartialAuthToken', () => ({
  validatePartialAuthToken: jest.fn((req, res, next) => next()),
}));

const { get } = createApi(app);

describe('GET /login/temporarily-suspended-access-code', () => {
  const originalEnv = process.env.FF_PORTAL_2FA_ENABLED;

  beforeAll(() => {
    // Enable Portal 2FA feature flag for these tests
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterAll(() => {
    // Restore original environment
    process.env.FF_PORTAL_2FA_ENABLED = originalEnv;
  });

  it('should render the temporarily suspended access code page with status 200', async () => {
    const response = await get('/login/temporarily-suspended-access-code');
    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.text).toContain('This account has been temporarily suspended');
    expect(response.text).toContain('data-cy="account-temporarily-suspended-heading"');
  });
});
