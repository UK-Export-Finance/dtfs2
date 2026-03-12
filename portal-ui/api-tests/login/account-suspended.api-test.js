import { createApi } from '@ukef/dtfs2-common/api-test';
import { HttpStatusCode } from 'axios';
import app from '../../server/createApp';
import api from '../../server/api';
import extractSessionCookie from '../helpers/extractSessionCookie';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/routes/middleware/validatePartialAuthToken', () => ({
  validatePartialAuthToken: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  sendSignInOTP: jest.fn(),
}));

const { get } = createApi(app);

describe('GET /login/temporarily-suspended-access-code', () => {
  const originalEnv = process.env.FF_PORTAL_2FA_ENABLED;

  beforeAll(() => {
    process.env.FF_PORTAL_2FA_ENABLED = 'true';
  });

  afterAll(() => {
    if (typeof originalEnv === 'undefined') {
      delete process.env.FF_PORTAL_2FA_ENABLED;
    } else {
      process.env.FF_PORTAL_2FA_ENABLED = originalEnv;
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the temporarily suspended access code page with status HttpStatusCode.Ok', async () => {
    // Arrange
    api.sendSignInOTP.mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: -1 } });

    const seedResponse = await get('/login/request-new-access-code');
    const sessionCookie = extractSessionCookie(seedResponse);

    // Act
    const response = await get('/login/temporarily-suspended-access-code', {}, { Cookie: sessionCookie });

    // Assert
    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.text).toContain('This account has been temporarily suspended');
  });
});
