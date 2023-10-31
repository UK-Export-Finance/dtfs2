const axios = require('axios');
const { when } = require('jest-when');
const { FEATURE_FLAGS } = require('./config/feature-flag.config');
const api = require('./api');

jest.mock('axios');
const { PORTAL_API_URL } = process.env;

(FEATURE_FLAGS.MAGIC_LINK ? describe : describe.skip)('api.login', () => {
  const username = 'a username';
  const password = 'a password';
  const token = 'a token';
  const loginStatus = 'Valid username and password';

  it('resolves with the token and login status from the portal-api response', async () => {
    when(axios).calledWith({
      method: 'post',
      url: `${PORTAL_API_URL}/v1/login`,
      headers: {
        'Content-Type': 'application/json',
      },
      data: { username, password },
    }).mockResolvedValueOnce({ data: { token, loginStatus } });

    const result = await api.login(username, password);

    expect(result).toStrictEqual({
      token,
      loginStatus,
    });
  });

  it('rejects with the error if the request to portal-api fails', async () => {
    const error = new Error();
    axios.mockRejectedValueOnce(error);

    const loginPromise = api.login(username, password);

    expect(loginPromise).rejects.toBe(error);
  });
});
