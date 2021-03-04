const app = require('../../../src/createApp');
const api = require('../../api')(app);


describe('user controller', () => {
  it('returns the requested user if matched', async () => {
    const username = 'myUsername';
    const { status, body } = await api.get(`/v1/users/${username}`);
    expect(status).toEqual(200);
    expect(body).toEqual({ user: { username } });
  });

  it('returns status 404 if user not matched', async () => {
    const username = 'invalidUser';
    const { status, body } = await api.get(`/v1/users/${username}`);
    expect(status).toEqual(404);
    expect(body).toEqual({ user: false });
  });
});
