const databaseHelper = require('../../database-helper');
const testUserCache = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const users = require('./test-data');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { LOGIN_STATUSES } = require('../../../src/constants');
const { createPartiallyLoggedInUserSession, createLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { STATUS } = require('../../../src/constants/user');

const aMaker = users.find((user) => user.username === 'MAKER');
const MOCK_USER = { ...aMaker, username: 'TEMPORARY_USER' };

describe('a user', () => {
  let aNonAdmin;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    const testUsers = await testUserCache.initialise(app);
    aNonAdmin = testUsers().withoutRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.deleteUser(MOCK_USER);
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
  });

  describe('DELETE /v1/users/:userId', () => {
    it('a user can be deleted', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      await as(aNonAdmin).remove(`/v1/users/${createdUser._id}`);

      const { status, body } = await as(aNonAdmin).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body).toMatchObject({});
    });
  });

  describe('DELETE /v1/users/:userId/disable', () => {
    it('a user can be disabled', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      await as(aNonAdmin).remove(`/v1/users/${createdUser._id}/disable`);

      const { status, body } = await as(aNonAdmin).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body).toMatchObject({
        disabled: true,
      });
    });
  });

  describe('POST /v1/login', () => {
    it('an unknown user cannot log in', async () => {
      const { username, password } = MOCK_USER;
      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'email or password is incorrect', success: false });
    });

    it('an incorrect password cannot log in', async () => {
      const { username } = MOCK_USER;
      await createUser(MOCK_USER);

      const { status, body } = await as().post({ username, password: 'NotTheUsersPassword' }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'email or password is incorrect', success: false });
    });

    it('a disabled user cannot log in', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;
      await as(aNonAdmin).remove(`/v1/users/${createdUser._id}/disable`);

      const { username, password } = MOCK_USER;
      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'user is disabled', success: false });
    });

    it('a known user can log in with a valid username and password', async () => {
      const { username, password } = MOCK_USER;
      await createUser(MOCK_USER);

      const { status, body } = await as().post({ username, password }).to('/v1/login');

      const expectedUserData = {
        ...MOCK_USER,
        _id: expect.any(String),
        timezone: 'Europe/London',
        'user-status': STATUS.ACTIVE,
      };
      delete expectedUserData.password;

      expect(status).toEqual(200);

      expect(body).toEqual({
        success: true,
        token: expect.any(String),
        user: { email: MOCK_USER.email },
        loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD,
        expiresIn: '105m',
      });
    });
  });

  describe('GET /v1/validate', () => {
    it('a token from a fully logged in user can be validated', async () => {
      await createUser(MOCK_USER);

      const { token } = await createLoggedInUserSession(MOCK_USER);

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(200);
    });

    it('a token from a partially logged in user cannot be validated', async () => {
      await createUser(MOCK_USER);

      const { token } = await createPartiallyLoggedInUserSession(MOCK_USER);

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(401);
    });

    it('invalid tokens fail validation', async () => {
      const token = 'some characters i think maybe look like a token';

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(401);
    });
  });

  it('User already exists', async () => {
    // User creation - first instance
    const first = await as(aNonAdmin).post(MOCK_USER).to('/v1/users');
    expect(first.status).toEqual(200);

    // User creation - second instance
    const second = await as(aNonAdmin).post(MOCK_USER).to('/v1/users');
    expect(second.status).toEqual(400);
  });

  describe('Attempting to login with NoSQL injection ', () => {
    const expectedBody = { msg: 'email or password is incorrect', success: false };

    it('should return a user cannot be found message', async () => {
      const username = "{$or: [{role: { $ne: '' }}]}";
      const { password } = MOCK_USER;

      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual(expectedBody);
    });

    it('an incorrect password cannot log in', async () => {
      const { username } = MOCK_USER;
      await createUser(MOCK_USER);

      const { status, body } = await as().post({ username, password: 'NotTheUsersPassword' }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual(expectedBody);
    });

    it('a disabled user cannot log in', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;
      await as(aNonAdmin).remove(`/v1/users/${createdUser._id}/disable`);

      const { username, password } = MOCK_USER;
      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'user is disabled', success: false });
    });

    it('a known user can log in with a valid username and password', async () => {
      const { username, password } = MOCK_USER;
      await createUser(MOCK_USER);

      const { status, body } = await as().post({ username, password }).to('/v1/login');

      const expectedUserData = {
        ...MOCK_USER,
        _id: expect.any(String),
        timezone: 'Europe/London',
        'user-status': STATUS.ACTIVE,
      };
      delete expectedUserData.password;

      expect(status).toEqual(200);

      expect(body).toEqual({
        success: true,
        token: expect.any(String),
        user: { email: MOCK_USER.email },
        loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD,
        expiresIn: '105m',
      });
    });
  });

  describe('GET /v1/validate', () => {
    it('a token from a fully logged in user can be validated', async () => {
      await createUser(MOCK_USER);

      const { token } = await createLoggedInUserSession(MOCK_USER);

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(200);
    });

    it('a token from a partially logged in user cannot be validated', async () => {
      await createUser(MOCK_USER);

      const { token } = await createPartiallyLoggedInUserSession(MOCK_USER);

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(401);
    });

    it('invalid tokens fail validation', async () => {
      const token = 'some characters i think maybe look like a token';

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(401);
    });
  });

  async function createUser(userToCreate) {
    return as(aNonAdmin).post(userToCreate).to('/v1/users');
  }
});
