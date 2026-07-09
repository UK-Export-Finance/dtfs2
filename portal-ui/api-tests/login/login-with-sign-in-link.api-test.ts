import { when } from 'jest-when';
import { HttpStatusCode } from 'axios';
import { PORTAL_LOGIN_STATUS } from '@ukef/dtfs2-common';
import { createApi } from '@ukef/dtfs2-common/api-test';
import app from '../../server/createApp';
import api from '../../server/api';
import { HTTP_ERROR_CAUSES } from '../../server/constants';

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual<typeof import('@ukef/dtfs2-common')>('@ukef/dtfs2-common'),
  verify: jest.fn((_req: unknown, _res: unknown, next: () => void): void => {
    next();
  }),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

describe('GET /login/sign-in-link?t={signInToken}&u={userId}', () => {
  const { get } = createApi(app);
  const validSignInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const validUserId = '65626dc0bda51f77a78b86ae';
  const userToken = 'a token';
  const loginStatus = PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const userEmail = 'an-email@example.com';
  const user = {
    email: userEmail,
  };

  const getSignInLinkLoginPage = (query: { u?: string; t?: string }) => get('/login/sign-in-link', query);

  it(`should return a ${HttpStatusCode.Ok} response if the login API request succeeds`, async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockResolvedValueOnce({ loginStatus, token: userToken, user });

    const { status } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.Ok);
  });

  it(`should redirect to /login/sign-in-link-expired if the login API request fails with a token expired ${HttpStatusCode.Forbidden}`, async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({
        response: { status: HttpStatusCode.Forbidden, data: { errors: [{ cause: HTTP_ERROR_CAUSES.TOKEN_EXPIRED }] } },
      });

    const { status, headers } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.Found);
    expect(headers.location).toEqual('/login/sign-in-link-expired');
  });

  it(`should redirect to /login/sign-in-link-expired if the login API request fails with a user blocked ${HttpStatusCode.Forbidden}`, async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({
        response: { status: HttpStatusCode.Forbidden, data: { errors: [{ cause: HTTP_ERROR_CAUSES.USER_BLOCKED }] } },
      });

    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.Forbidden);
    expect(text).toContain('This account has been temporarily suspended');
  });

  it(`should redirect to /login if the login API request fails with a ${HttpStatusCode.Unauthorized}`, async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({ response: { status: HttpStatusCode.Unauthorized } });

    const { status, headers } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.Found);
    expect(headers.location).toEqual('/login');
  });

  it(`should redirect to /login if the login API request fails with a ${HttpStatusCode.NotFound}`, async () => {
    when(api.loginWithSignInLink)
      .calledWith({ signInToken: validSignInToken, userId: validUserId })
      .mockRejectedValueOnce({ response: { status: HttpStatusCode.NotFound } });

    const { status, headers } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.Found);
    expect(headers.location).toEqual('/login');
  });

  it(`should return a ${HttpStatusCode.InternalServerError} response if the login API request has an unexpected error`, async () => {
    when(api.loginWithSignInLink).calledWith({ signInToken: validSignInToken, userId: validUserId }).mockRejectedValueOnce(new Error());

    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.InternalServerError);
    expect(text).toContain('Problem with the service');
  });

  it(`should return a ${HttpStatusCode.BadRequest} response if the u query string is not a valid ObjectId`, async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: '123', t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(text).toContain('Problem with the service');
  });

  it(`should return a ${HttpStatusCode.BadRequest} response if the u query string is not provided`, async () => {
    const { status, text } = await getSignInLinkLoginPage({ t: validSignInToken });

    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(text).toContain('Problem with the service');
  });

  it(`should return a ${HttpStatusCode.BadRequest} response if the u query string is empty`, async () => {
    const { status, text } = await getSignInLinkLoginPage({ t: validSignInToken, u: '' });

    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(text).toContain('Problem with the service');
  });

  it(`should return a ${HttpStatusCode.BadRequest} response if the t query string is not a string of hex characters`, async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: 'not-a-hex-string' });

    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(text).toContain('Problem with the service');
  });

  it(`should return a ${HttpStatusCode.BadRequest} response if the t query string is not provided`, async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: validUserId });

    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(text).toContain('Problem with the service');
  });

  it(`should return a ${HttpStatusCode.BadRequest} response if the t query string is empty`, async () => {
    const { status, text } = await getSignInLinkLoginPage({ u: validUserId, t: '' });

    expect(status).toEqual(HttpStatusCode.BadRequest);
    expect(text).toContain('Problem with the service');
  });
});
