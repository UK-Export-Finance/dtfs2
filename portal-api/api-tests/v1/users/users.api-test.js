import { HttpStatusCode } from 'axios';

const { ObjectId } = require('mongodb');
const { withDeleteOneTests, expectAnyPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { MONGO_DB_COLLECTIONS, PORTAL_LOGIN_STATUS, generatePasswordHash } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const testUserCache = require('../../api-test-users');
const { createUser } = require('../../helpers/create-user');

const app = require('../../../server/createApp');
const { as } = require('../../api')(app);

const users = require('./test-data');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { createPartiallyLoggedInUserSession, createLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');
const { ADMIN } = require('../../../server/v1/roles/roles');
const { STATUS } = require('../../../server/constants/user');

const temporaryUsernameAndEmail = 'temporary_user@ukexportfinance.gov.uk';
const MOCK_USER = {
  ...users.testBank1Maker1,
  username: temporaryUsernameAndEmail,
  email: temporaryUsernameAndEmail,
};

describe('a user', () => {
  let aNonAdmin;
  let initialUsers;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    const testUsers = await testUserCache.initialise(app);
    aNonAdmin = testUsers().withoutRole(ADMIN).one();
    initialUsers = testUsers().all();
  });

  beforeEach(async () => {
    await databaseHelper.deleteUser(MOCK_USER);
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
  });

  describe('GET /v1/users', () => {
    it(`should return ${HttpStatusCode.Ok}`, async () => {
      // Act
      const response = await as(aNonAdmin).get('/v1/users');

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Ok);
      // initial users plus the api-test-user we create first
      const expectedUsersCount = initialUsers.length + 1;
      expect(response.body.count).toEqual(expectedUsersCount);
    });
  });

  describe('GET /v1/users/:userId', () => {
    let userToGetId;

    beforeEach(async () => {
      const response = await createUser(MOCK_USER, aNonAdmin);
      userToGetId = new ObjectId(response.body.user._id);
    });

    describe(`when getting a user Id`, () => {
      it(`should return ${HttpStatusCode.Ok}`, async () => {
        // Act
        const response = await as(aNonAdmin).get(`/v1/users/${userToGetId}`);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
      });

      it('should return an empty object if the user does not exist', async () => {
        // Arrange
        const anotherId = '123456789f0ffe00219319c1';

        // Act
        const response = await as(aNonAdmin).get(`/v1/users/${anotherId}`);

        // Assert
        expect(response.status).toEqual(HttpStatusCode.Ok);
        expect(response.body).toEqual({});
      });
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    let userToDeleteId;

    beforeEach(async () => {
      await databaseHelper.deleteUser(MOCK_USER);
      const response = await createUser(MOCK_USER, aNonAdmin);
      userToDeleteId = new ObjectId(response.body.user._id);
    });

    withDeleteOneTests({
      makeRequest: () => as(aNonAdmin).remove().to(`/v1/users/${userToDeleteId}`),
      collectionName: MONGO_DB_COLLECTIONS.USERS,
      auditRecord: expectAnyPortalUserAuditDatabaseRecord(),
      getDeletedDocumentId: () => userToDeleteId,
    });
  });

  describe('DELETE /v1/users/:userId/disable', () => {
    it('a user can be disabled', async () => {
      const response = await createUser(MOCK_USER, aNonAdmin);
      const createdUser = response.body.user;

      await as(aNonAdmin).remove().to(`/v1/users/${createdUser._id}/disable`);

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
      await createUser(MOCK_USER, aNonAdmin);

      const { status, body } = await as().post({ username, password: 'NotTheUsersPassword' }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'email or password is incorrect', success: false });
    });

    it('a disabled user cannot log in', async () => {
      const response = await createUser(MOCK_USER, aNonAdmin);
      const createdUser = response.body.user;
      const { salt, hash } = generatePasswordHash(MOCK_USER.password);

      // set a known reset token/timestamp on the user record
      await databaseHelper.setUserProperties({
        username: MOCK_USER.username,
        update: {
          salt,
          hash,
          resetPwdToken: hash,
          resetPwdTimestamp: `${Date.now()}`,
        },
      });

      await as(aNonAdmin).remove().to(`/v1/users/${createdUser._id}/disable`);

      const { username, password } = MOCK_USER;
      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'user is disabled', success: false });
    });

    it('a known user can log in with a valid username and password', async () => {
      const { username, password } = MOCK_USER;
      await createUser(MOCK_USER, aNonAdmin);
      const { salt, hash } = generatePasswordHash(MOCK_USER.password);

      // set a known reset token/timestamp on the user record
      await databaseHelper.setUserProperties({
        username: MOCK_USER.username,
        update: {
          salt,
          hash,
          resetPwdToken: hash,
          resetPwdTimestamp: `${Date.now()}`,
        },
      });

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
        user: { email: MOCK_USER.email, userId: expect.any(String) },
        loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
        expiresIn: '105m',
      });
    });
  });

  describe('GET /v1/validate', () => {
    it('a token from a fully logged in user can be validated', async () => {
      await createUser(MOCK_USER, aNonAdmin);

      const { token } = await createLoggedInUserSession(MOCK_USER);

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(200);
    });

    it('a token from a partially logged in user cannot be validated', async () => {
      await createUser(MOCK_USER, aNonAdmin);

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
    const userToCreate = {
      ...MOCK_USER,
    };
    delete userToCreate?.password;
    const first = await as(aNonAdmin).post(userToCreate).to('/v1/users');
    expect(first.status).toEqual(200);

    // User creation - second instance
    const second = await as(aNonAdmin).post(userToCreate).to('/v1/users');
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
      await createUser(MOCK_USER, aNonAdmin);

      const { status, body } = await as().post({ username, password: 'NotTheUsersPassword' }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual(expectedBody);
    });

    it('a disabled user cannot log in', async () => {
      const response = await createUser(MOCK_USER, aNonAdmin);
      const createdUser = response.body.user;

      const { salt, hash } = generatePasswordHash(MOCK_USER.password);

      // set a known reset token/timestamp on the user record
      await databaseHelper.setUserProperties({
        username: MOCK_USER.username,
        update: {
          salt,
          hash,
          resetPwdToken: hash,
          resetPwdTimestamp: `${Date.now()}`,
        },
      });

      await as(aNonAdmin).remove().to(`/v1/users/${createdUser._id}/disable`);

      const { username, password } = MOCK_USER;
      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual({ msg: 'user is disabled', success: false });
    });

    it('a known user can log in with a valid username and password', async () => {
      const { username, password } = MOCK_USER;
      await createUser(MOCK_USER, aNonAdmin);

      const { salt, hash } = generatePasswordHash(MOCK_USER.password);

      // set a known reset token/timestamp on the user record
      await databaseHelper.setUserProperties({
        username: MOCK_USER.username,
        update: {
          salt,
          hash,
          resetPwdToken: hash,
          resetPwdTimestamp: `${Date.now()}`,
        },
      });

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
        user: { email: MOCK_USER.email, userId: expect.any(String) },
        loginStatus: PORTAL_LOGIN_STATUS.VALID_USERNAME_AND_PASSWORD,
        expiresIn: '105m',
      });
    });
  });

  describe('GET /v1/validate', () => {
    it('a token from a fully logged in user can be validated', async () => {
      await createUser(MOCK_USER, aNonAdmin);

      const { token } = await createLoggedInUserSession(MOCK_USER);

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(200);
    });

    it('a token from a partially logged in user cannot be validated', async () => {
      await createUser(MOCK_USER, aNonAdmin);

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
});
