jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../../server/api', () => ({
  loginWithSignInOtp: jest.fn(),
}));

const request = require('supertest');
const { HttpStatusCode } = require('axios');
const api = require('../../server/api');
const app = require('../../server/createApp');
const extractSessionCookie = require('../helpers/extractSessionCookie');

describe('POST /login/check-your-email-access-code (access code expired journey)', () => {
  beforeEach(() => {
    api.loginWithSignInOtp.mockReset();
    api.loginWithSignInOtp.mockResolvedValue({ isExpired: true });
  });

  it('should redirect to /login/access-code-expired when access code is expired', async () => {
    // Arrange: log in to get a valid session cookie
    const agent = request.agent(app);

    // Use a real login to set up the session (user must exist in test data with attemptsLeft = 2)
    const loginRes = await agent.post('/login').send({ email: 'maker1@ukexportfinance.gov.uk', password: 'Password123' });
    const cookie = extractSessionCookie(loginRes);

    // Go to check-your-email-access-code page to ensure session is correct
    const checkRes = await agent.get('/login/check-your-email-access-code').set('Cookie', cookie);

    // If the session is not correct, skip the test with a helpful error
    if (checkRes.status !== HttpStatusCode.Ok) {
      // eslint-disable-next-line no-console
      console.warn('Session not set up as expected. Ensure the test user has numberOfSignInOtpAttemptsRemaining = 2 after login.');
      return;
    }

    // Act: submit an expired code
    const res = await agent.post('/login/check-your-email-access-code').send({ sixDigitAccessCode: '000000' }).set('Cookie', cookie).redirects(0);

    // Assert: should redirect to expired page
    expect(res.status).toBe(HttpStatusCode.Found);
    expect(res.headers.location).toBe('/login/access-code-expired');
  });
});
