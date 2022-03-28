const app = require('../../../src/createApp');
const api = require('../../api')(app);
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('user controller', () => {
  let userId = '';
  it('creates a new TFM user', async () => {
    const user = MOCK_USERS[0];
    delete user._id;
    const { body } = await api.post(user).to('/v1/users');
    userId = body.user._id;
  });

  it('returns the requested user if matched', async () => {
    const expectedResponse = { _id: userId, ...MOCK_USERS[0], status: 'active' };
    delete expectedResponse.password;

    const { status, body } = await api.get(`/v1/users/${userId}`);
    expect(status).toEqual(200);
    expect(body.user).toEqual(expectedResponse);
  });

  it('returns status 404 if userId not matched', async () => {
    const _id = '6051d94564494924d38ce67c';
    const { status, body } = await api.get(`/v1/users/${_id}`);
    expect(status).toEqual(404);
    expect(body.status).toEqual(404);
    expect(body.message).toEqual('User does not exist');
  });

  it('removes the TFM user by _id', async () => {
    const { status } = await api.remove().to(`/v1/users/${userId}`);
    expect(status).toEqual(200);
  });
});
