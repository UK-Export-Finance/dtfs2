const app = require('../../../src/createApp');
const { as } = require('../../api')(app);
const testUserCache = require('../../api-test-users');
const MOCK_USERS = require('../../../src/v1/__mocks__/mock-users');

describe('user controller', () => {
  let newUserId = '';
  let tokenUser;
  const userForAuth = MOCK_USERS[0];
  const userToCreate = MOCK_USERS[1];

  const NOT_EXISTING_USER_ID = '12345678901234567890abcd';
  const NOT_VALID_USER_ID = 'Z1234567890abcd';

  beforeEach(async () => {
    tokenUser = await testUserCache.initialise();
  });

  afterAll(async() => {
    // Remove test data.
    await as(tokenUser).remove().to(`/v1/users/${userToCreate._id}`);
    await as(tokenUser).remove().to(`/v1/users/${userForAuth._id}`);
  })

  describe('create user', () => {
    it('should not create a new TFM user with malformed payload', async () => {
      const { body, status } = await as(tokenUser).post({}).to('/v1/users');
      expect(status).toEqual(400);
      expect(body).toEqual({
        errors: {count: 1, errorList: [ 'User creation failed']},
        success: false,
      });
    });

    it('should not create a new TFM user with extra fields in payload', async () => {
      const user = userToCreate;
      delete user._id;

      const { status, body } = await as(tokenUser).post({ user, extraField: 'test' }).to('/v1/users');

      expect(status).toEqual(400);
      expect(body).toEqual({
        errors: {count: 1, errorList: [ 'User creation failed']},
        success: false,
      });
    });


    it('creates a new TFM user', async () => {
      const user = userToCreate;
      delete user._id;

      const { status, body } = await as(tokenUser).post(user).to('/v1/users');
      newUserId = body.user._id;

      expect(status).toEqual(200);
      expect(body.user).toEqual(expect.objectContaining({
        _id: expect.any(String),
        ...user
      }));
    });
  });

  describe('get user', () => {
    it('returns the requested user if matched', async () => {
      const expectedResponse = { _id: newUserId, ...userToCreate };
      delete expectedResponse.password;

      const { status, body } = await as(tokenUser).get(`/v1/users/${newUserId}`);

      // deleted as token is added on api insertion/login
      delete expectedResponse.token;

      expect(status).toEqual(200);
      expect(body.user).toEqual(expectedResponse);
    });

    it('returns status 400 if userId is not valid MongoDB id', async () => {
      const { status, body } = await as(tokenUser).get(`/v1/users/${NOT_VALID_USER_ID}`);
      expect(status).toEqual(400);
      expect(body.status).toEqual(400);
      expect(body.message).toEqual('User id is not valid');
    });

    it('returns status 404 if userId not matched', async () => {
      const { status, body } = await as(tokenUser).get(`/v1/users/${NOT_EXISTING_USER_ID}`);
      expect(status).toEqual(404);
      expect(body.status).toEqual(404);
      expect(body.message).toEqual('User does not exist');
    });
  });

  describe('remove user', () => {
    it('removes the TFM user by _id', async () => {
      const { status } = await as(tokenUser).remove().to(`/v1/users/${newUserId}`);
      expect(status).toEqual(200);
    });

    it('returns status 200 if userId not matched for deletion', async () => {
      const { status } = await as(tokenUser).remove().to(`/v1/users/${NOT_EXISTING_USER_ID}`);
      expect(status).toEqual(200);
    });

    it('returns status 400 if userId is not valid', async () => {
      const { status } = await as(tokenUser).remove().to(`/v1/users/${NOT_VALID_USER_ID}`);
      expect(status).toEqual(400);
    });
  });
});
