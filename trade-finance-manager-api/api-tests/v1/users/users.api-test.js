const app = require('../../../src/createApp');
const api = require('../../api')(app);
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('user controller', () => {
  it('returns the requested user if matched', async () => {
    const MOCK_USER = MOCK_USERS[1];
    const { username } = MOCK_USER;

    const { status, body } = await api.get(`/v1/users/${username}`);
    expect(status).toEqual(200);
    expect(body.user).toEqual(MOCK_USER);
  });

  it('returns status 404 if user not matched', async () => {
    const username = 'invalidUser';
    const { status, body } = await api.get(`/v1/users/${username}`);
    expect(status).toEqual(404);
    expect(body).toEqual({ user: false });
  });
});
