const axios = require('axios');
const { when } = require('jest-when');
const { HEADERS, PORTAL_LOGIN_STATUS, PORTAL_AMENDMENT_SUBMITTED_STATUSES } = require('@ukef/dtfs2-common');
const api = require('./api');

jest.mock('axios');
const { PORTAL_API_URL, PORTAL_API_KEY } = process.env;

const headers = {
  [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
  'x-api-key': PORTAL_API_KEY,
};

describe('api.login', () => {
  const username = 'a username';
  const password = 'a password';
  const token = 'a token';
  const loginStatus = PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const user = {
    email: 'an-email@example.com',
  };

  it('resolves with the token and login status from the portal-api response', async () => {
    when(axios)
      .calledWith({
        method: 'post',
        url: `${PORTAL_API_URL}/v1/login`,
        headers,
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

    await expect(loginPromise).rejects.toEqual(error);
  });
});

describe('api.loginWithSignInLink', () => {
  const userId = '65626dc0bda51f77a78b86ae';
  const signInToken = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const token2fa = 'a 2fa token';
  const tokenFromPortalApi = 'a token from portal api';

  const loginStatus = PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD;
  const user = {
    email: 'an-email@example.com',
  };

  it('resolves with the token and login status from the portal-api response', async () => {
    when(axios)
      .calledWith({
        method: 'post',
        url: `${PORTAL_API_URL}/v1/users/${userId}/sign-in-link/${signInToken}/login`,
        headers: {
          [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
          Authorization: token2fa,
        },
      })
      .mockResolvedValueOnce({ data: { token: tokenFromPortalApi, loginStatus, user } });

    const result = await api.loginWithSignInLink({ token: token2fa, signInToken, userId });

    expect(result).toStrictEqual({
      token: tokenFromPortalApi,
      loginStatus,
      user,
    });
  });

  it('rejects with the error if the request to portal-api fails', async () => {
    const error = new Error();
    axios.mockRejectedValueOnce(error);

    const loginPromise = api.loginWithSignInLink({ token: token2fa, signInToken, userId });

    await expect(loginPromise).rejects.toEqual(error);
  });
});

describe('api.getAllAmendments', () => {
  const userToken = 'test-token';
  const mockResponseData = [
    { dealId: 'deal1', amendmentId: 'amendment1' },
    { dealId: 'deal2', amendmentId: 'amendment2' },
  ];

  it('should return all submitted amendments when the API call is successful', async () => {
    when(axios)
      .calledWith({
        method: 'get',
        url: `${PORTAL_API_URL}/v1/gef/facilities/amendments`,
        headers: {
          Authorization: userToken,
          [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        },
        params: { statuses: PORTAL_AMENDMENT_SUBMITTED_STATUSES },
      })
      .mockResolvedValue({ data: mockResponseData });

    const result = await api.getAllAmendments({ statuses: PORTAL_AMENDMENT_SUBMITTED_STATUSES, userToken });

    expect(result).toEqual(mockResponseData);
  });

  it('should throw an error when the API call fails', async () => {
    const error = new Error('API call failed');
    axios.mockRejectedValueOnce(error);

    const getAllAmendmentsPromise = api.getAllAmendments({ statuses: PORTAL_AMENDMENT_SUBMITTED_STATUSES, userToken });

    await expect(getAllAmendmentsPromise).rejects.toThrow('API call failed');
  });

  it('should return all amendments when statuses are an empty array', async () => {
    const emptyStatuses = [];
    when(axios)
      .calledWith({
        method: 'get',
        url: `${PORTAL_API_URL}/v1/gef/facilities/amendments`,
        headers: {
          Authorization: userToken,
          [HEADERS.CONTENT_TYPE.KEY]: HEADERS.CONTENT_TYPE.VALUES.JSON,
        },
        params: { statuses: emptyStatuses },
      })
      .mockResolvedValue({ data: mockResponseData });

    const result = await api.getAllAmendments({ statuses: emptyStatuses, userToken });

    expect(result).toEqual(mockResponseData);
  });
});
