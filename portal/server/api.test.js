const axios = require('axios');
const { when } = require('jest-when');
const api = require('./api');
const { LOGIN_STATUS } = require('./constants');

jest.mock('axios');
const { PORTAL_API_URL } = process.env;

describe('api.login', () => {
  const username = 'a username';
  const password = 'a password';
  const token = 'a token';
  const loginStatus = LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const user = {
    email: 'an-email@example.com',
  };

  it('resolves with the token and login status from the portal-api response', async () => {
    when(axios)
      .calledWith({
        method: 'post',
        url: `${PORTAL_API_URL}/v1/login`,
        headers: {
          'Content-Type': 'application/json',
        },
        data: { username, password },
      })
      .mockResolvedValueOnce({ data: { token, loginStatus, user } });

    const result = await api.login(username, password);

    expect(result).toStrictEqual({
      token,
      loginStatus,
      user,
    });
  });

  it('rejects with the error if the request to portal-api fails', async () => {
    const error = new Error();
    axios.mockRejectedValueOnce(error);

    const loginPromise = api.login(username, password);

    await expect(loginPromise).rejects.toBe(error);
  });
});

describe('api.loginWithSignInLink', () => {
  const signInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const token2fa = 'a 2fa token';
  const tokenFromPortalApi = 'a token from portal api';

  const loginStatus = LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const user = {
    email: 'an-email@example.com',
  };

  it('resolves with the token and login status from the portal-api response', async () => {
    when(axios)
      .calledWith({
        method: 'post',
        url: `${PORTAL_API_URL}/v1/users/me/sign-in-link/${signInToken}/login`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: token2fa,
        },
      })
      .mockResolvedValueOnce({ data: { token: tokenFromPortalApi, loginStatus, user } });

    const result = await api.loginWithSignInLink({ token: token2fa, signInToken });

    expect(result).toStrictEqual({
      token: tokenFromPortalApi,
      loginStatus,
      user,
    });
  });

  it('rejects with the error if the request to portal-api fails', async () => {
    const error = new Error();
    axios.mockRejectedValueOnce(error);

    const loginPromise = api.loginWithSignInLink({ token: token2fa, signInToken });

    await expect(loginPromise).rejects.toBe(error);
  });
});
