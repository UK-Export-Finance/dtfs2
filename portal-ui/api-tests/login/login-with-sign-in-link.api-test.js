jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { when } = require('jest-when');
const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const app = require('../../server/createApp');
const api = require('../../server/api');
const { HTTP_ERROR_CAUSES } = require('../../server/constants');

const { get } = createApi(app);

describe('GET /login/sign-in-link?t={signInToken}&u={userId}', () => {
  const validSignInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const validUserId = '65626dc0bda51f77a78b86ae';
  const userToken = 'a token';
  const loginStatus = PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const userEmail = 'an-email@example.com';
  const user = {
    email: userEmail,
  };

  const getSignInLinkLoginPage = (query) => get('/login/sign-in-link', query);

  it('returns a 200 response if the login API request succeeds', async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockResolvedValueOnce({ loginStatus, token: userToken, user });

    const { status } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(200);
  });

  it('redirects to /login/sign-in-link-expired if the login API request fails with a token expired 403', async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({
        response: { status: 403, data: { errors: [{ cause: HTTP_ERROR_CAUSES.TOKEN_EXPIRED }] } },
      });

    const { status, headers } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(302);
    expect(headers.location).toEqual('/login/sign-in-link-expired');
  });

  it('redirects to /login/sign-in-link-expired if the login API request fails with a user blocked 403', async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({
        response: { status: 403, data: { errors: [{ cause: HTTP_ERROR_CAUSES.USER_BLOCKED }] } },
      });

    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(403);
    expect(text).toContain('This account has been temporarily suspended');
  });

  it('redirects to /login if the login API request fails with a 401', async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({ response: { status: 401 } });

    const { status, headers } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(302);
    expect(headers.location).toEqual('/login');
  });

  it('redirects to /login if the login API request fails with a 404', async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({ response: { status: 404 } });

    const { status, headers } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(302);
    expect(headers.location).toEqual('/login');
  });

  it('returns a 500 response if the login API request has an unexpected error', async () => {
    when(api.loginWithSignInLink).calledWith({ signInToken: validSignInToken, userId: validUserId }).mockRejectedValueOnce(new Error());

    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(500);
    expect(text).toContain('Problem with the service');
  });

  it('returns a 400 response if the u query string is not a valid ObjectId', async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: '123', t: validSignInToken });

    expect(status).toEqual(400);
    expect(text).toContain('Problem with the service');
  });

  it('returns a 400 response if the u query string is not provided', async () => {
    const { status, text } = await getSignInLinkLoginPage({ t: validSignInToken });

    expect(status).toEqual(400);
    expect(text).toContain('Problem with the service');
  });

  it('returns a 400 response if the u query string is empty', async () => {
    const { status, text } = await getSignInLinkLoginPage({ t: validSignInToken, u: '' });

    expect(status).toEqual(400);
    expect(text).toContain('Problem with the service');
  });

  it('returns a 400 response if the t query string is not a string of hex characters', async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: 'not-a-hex-string' });

    expect(status).toEqual(400);
    expect(text).toContain('Problem with the service');
  });

  it('returns a 400 response if the t query string is not provided', async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: validUserId });

    expect(status).toEqual(400);
    expect(text).toContain('Problem with the service');
  });

  it('returns a 400 response if the t query string is empty', async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: '' });

    expect(status).toEqual(400);
    expect(text).toContain('Problem with the service');
  });
});
