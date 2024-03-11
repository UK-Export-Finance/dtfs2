const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('user controller', () => {
  let userId = '';
  let tokenUser;

  beforeEach(async () => {
    tokenUser = await testUserCache.initialise();
  });

  it('should not create a new TFM user with malformed payload', async () => {
    const { body, status } = await as(tokenUser).post({}).to('/v1/users');
    expect(status).toEqual(400);
    expect(body).toEqual({
      errors: {count: 1, errorList: [ 'User creation failed']},
      success: false,
    });
  });

  it('creates a new TFM user', async () => {
    const user = MOCK_USERS[0];
    delete user._id;

    const { body } = await as(tokenUser).post(user).to('/v1/users');
    userId = body.user._id;
  });

  it('removes the TFM user by _id', async () => {
    const { status } = await as(tokenUser).remove().to(`/v1/users/${userId}`);
    expect(status).toEqual(200);
  });
});
