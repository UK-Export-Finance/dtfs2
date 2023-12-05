const databaseHelper = require('../../database-helper');
const { setUpApiTestUser } = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const users = require('./test-data');
const { READ_ONLY, MAKER, CHECKER } = require('../../../src/v1/roles/roles');
const { NON_READ_ONLY_ROLES } = require('../../../test-helpers/common-role-lists');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { LOGIN_STATUSES } = require('../../../src/constants');
const { FEATURE_FLAGS } = require('../../../src/config/feature-flag.config');
const { createPartiallyLoggedInUserSession, createLoggedInUserSession } = require('../../../test-helpers/api-test-helpers/database/user-repository');

const aMaker = users.find((user) => user.username === 'MAKER');
const MOCK_USER = { ...aMaker, username: 'TEMPORARY_USER' };

const PASSWORD_ERROR = {
  text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.',
};
const EMAIL_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };
const READ_ONLY_ROLE_EXCLUSIVE_ERROR = { text: "You cannot combine 'Read-only' with any of the other roles" };

describe('a user', () => {
  let loggedInUser;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    loggedInUser = await setUpApiTestUser(as);
  });

  beforeEach(async () => {
    await databaseHelper.deleteUser(MOCK_USER);
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
  });

  describe('POST /v1/users', () => {
    it('rejects if the provided password contains zero numeric characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: 'No-numeric-characters',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero upper-case characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '0-upper-case-characters',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero lower-case characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '0-LOWER-CASE-CHARACTERS',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero special characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '0specialCharacters',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains fewer than 8 characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '1234567',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided email address is not in valid format', async () => {
      const newUser = {
        ...MOCK_USER,
        email: 'abc',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
    });

    it('rejects if the provided email address is empty', async () => {
      const newUser = {
        ...MOCK_USER,
        email: '',
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
    });

    it('creates the user if all provided data is valid', async () => {
      await createUser(MOCK_USER);
      const { status, body } = await as(loggedInUser).get('/v1/users');

      expect(status).toEqual(200);
      expect(body).toEqual({
        success: true,
        count: 2,
        users: [
          expect.objectContaining({ username: loggedInUser.username }),
          {
            username: MOCK_USER.username,
            email: MOCK_USER.email,
            roles: MOCK_USER.roles,
            bank: MOCK_USER.bank,
            _id: expect.any(String),
            firstname: MOCK_USER.firstname,
            surname: MOCK_USER.surname,
            timezone: 'Europe/London',
            'user-status': 'active',
          },
        ],
      });
    });

    it('User already exists', async () => {
      // User creation - first instance
      const first = await createUser(MOCK_USER);
      expect(first.status).toEqual(200);

      // User creation - second instance
      const second = await createUser(MOCK_USER);
      expect(second.status).toEqual(400);
    });

    it.each(NON_READ_ONLY_ROLES)('rejects if the user creation request has the read-only role and the %s role', async (otherRole) => {
      const newUser = {
        ...MOCK_USER,
        roles: [READ_ONLY, otherRole],
      };

      const { status, body } = await createUser(newUser);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.roles).toStrictEqual(READ_ONLY_ROLE_EXCLUSIVE_ERROR);
    });

    it('creates the user if the user creation request has the read-only role repeated', async () => {
      const newUser = {
        ...MOCK_USER,
        roles: [READ_ONLY, READ_ONLY],
      };

      await createUser(newUser);
      const { status, body } = await as(loggedInUser).get('/v1/users');

      expect(status).toEqual(200);
      expect(body.users[1].roles).toStrictEqual([READ_ONLY, READ_ONLY]);
    });

    it('creates the user the user creation request has the read-only role only', async () => {
      const newUser = {
        ...MOCK_USER,
        roles: [READ_ONLY],
      };

      await createUser(newUser);
      const { status, body } = await as(loggedInUser).get('/v1/users');

      expect(status).toEqual(200);
      expect(body.users[1].roles).toStrictEqual([READ_ONLY]);
    });
  });

  describe('PUT /v1/users', () => {
    it('a user can be updated', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      const updatedUserCredentials = {
        roles: [CHECKER, MAKER],
      };

      await as(loggedInUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

      const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body.roles).toEqual([CHECKER, MAKER]);
    });

    it.each(NON_READ_ONLY_ROLES)('rejects if the user update request has the read-only role with the %s role', async (otherRole) => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      const updatedUserCredentials = {
        roles: [READ_ONLY, otherRole],
      };

      const { status, body } = await as(loggedInUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.roles).toStrictEqual(READ_ONLY_ROLE_EXCLUSIVE_ERROR);
    });

    it('updates the user if the user update request has the read-only role only', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      const updatedUserCredentials = {
        roles: [READ_ONLY],
      };

      await as(loggedInUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

      const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body.roles).toEqual([READ_ONLY]);
    });

    it('updates the user if the user update request has the read-only role repeated', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      const updatedUserCredentials = {
        roles: [READ_ONLY, READ_ONLY],
      };

      await as(loggedInUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

      const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body.roles).toStrictEqual([READ_ONLY, READ_ONLY]);
    });
  });

  describe('DELETE /v1/users/:userId', () => {
    it('a user can be deleted', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      await as(loggedInUser).remove(`/v1/users/${createdUser._id}`);

      const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body).toMatchObject({});
    });
  });

  describe('DELETE /v1/users/:userId/disable', () => {
    it('a user can be disabled', async () => {
      const response = await createUser(MOCK_USER);
      const createdUser = response.body.user;

      await as(loggedInUser).remove(`/v1/users/${createdUser._id}/disable`);

      const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

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
      await as(loggedInUser).remove(`/v1/users/${createdUser._id}/disable`);

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
        'user-status': 'active',
      };
      delete expectedUserData.password;

      expect(status).toEqual(200);

      // TODO DTFS2-6680: remove this feature flag check
      if (!FEATURE_FLAGS.MAGIC_LINK) {
        expect(body).toEqual({
          success: true,
          token: expect.any(String),
          user: expectedUserData,
          expiresIn: '12h',
        });
      } else {
        expect(body).toEqual({
          success: true,
          token: expect.any(String),
          loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD,
          user: { email: MOCK_USER.email },
          expiresIn: '105m',
        });
      }
    });
  });

  // TODO DTFS2-6680: remove this feature flag check
  if (FEATURE_FLAGS.MAGIC_LINK) {
    describe('POST /v1/users/me/sign-in-link/:signInToken/login', () => {
      let token;
      let signInToken;
      let userId;
      beforeEach(async () => {
        const response = await createUser(MOCK_USER);
        const createdUser = response.body.user;
        ({ userId, token, signInToken } = await createPartiallyLoggedInUserSession(createdUser));
      });

      describe('a known user with an email link', () => {
        it('can successfully log in', async () => {
          const { status, body } = await as({ ...MOCK_USER, token })
            .post()
            .to(`/v1/users/me/sign-in-link/${signInToken}/login`);

          const expectedUserData = {
            ...MOCK_USER,
            _id: expect.any(String),
            timezone: 'Europe/London',
            'user-status': 'active',
          };
          delete expectedUserData.password;

          expect(status).toEqual(200);
          expect(body).toEqual({
            success: true,
            token: expect.any(String),
            user: expectedUserData,
            loginStatus: LOGIN_STATUSES.VALID_2FA,
            expiresIn: '12h',
          });
        });
      });

      describe('a known user with an email link without a token', () => {
        it('cannot successfully log in', async () => {
          const { status } = await as({ ...MOCK_USER })
            .post()
            .to(`/v1/users/me/sign-in-link/${signInToken}/login`);

          expect(status).toEqual(401);
        });
      });

      describe('a known user with an incorrect sign in token', () => {
        it('cannot successfully log in', async () => {
          const { status, body } = await as({ ...MOCK_USER, token })
            .post()
            .to('/v1/users/me/sign-in-link/123/login');

          expect(status).toEqual(403);
          expect(body).toEqual({ error: 'Forbidden', message: `Invalid sign in token for user ID: ${userId}` });
        });
      });
    });

    describe('NoSQL injection attempts', () => {
      const expectedBody = { msg: 'email or password is incorrect', success: false };

      const injectionUsernames = ['{$or: [{role: { $ne: "" }}]}', '{ "$ne": "" }', '{ "$gt": "" }', '{ "$lt": "" }'];

      describe.each(injectionUsernames)('when username is "%s"', (username) => {
        it('should return a user cannot be found message', async () => {
          const { password } = MOCK_USER;
          const injectedUser = {
            ...MOCK_USER,
            username,
            email: username,
          };

          await createUser(injectedUser);

          const { status, body } = await as().post({ username, password }).to('/v1/login');

          expect(status).toEqual(401);
          expect(body).toEqual(expectedBody);
        });
      });
    });
  }

  describe('GET /v1/validate', () => {
    it('a token from a fully logged in user can be validated', async () => {
      await createUser(MOCK_USER);

      let token;
      if (FEATURE_FLAGS.MAGIC_LINK) {
        ({ token } = await createLoggedInUserSession(MOCK_USER));
      } else {
        const { username, password } = MOCK_USER;
        const { body: loginBody } = await as().post({ username, password }).to('/v1/login');
        token = loginBody.token;
      }

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(200);
    });

    // TODO DTFS2-6680: remove this feature flag check
    if (FEATURE_FLAGS.MAGIC_LINK) {
      it('a token from a partially logged in user cannot be validated', async () => {
        await createUser(MOCK_USER);

        const { token } = await createPartiallyLoggedInUserSession(MOCK_USER);

        const { status } = await as({ token }).get('/v1/validate');

        expect(status).toEqual(401);
      });
    }

    it('invalid tokens fail validation', async () => {
      const token = 'some characters i think maybe look like a token';

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(401);
    });
  });

  it('User already exists', async () => {
    // User creation - first instance
    const first = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    expect(first.status).toEqual(200);

    // User creation - second instance
    const second = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
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
      await as(loggedInUser).remove(`/v1/users/${createdUser._id}/disable`);

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
        'user-status': 'active',
      };
      delete expectedUserData.password;

      expect(status).toEqual(200);

      // TODO DTFS2-6680: remove this feature flag check
      if (!FEATURE_FLAGS.MAGIC_LINK) {
        expect(body).toEqual({
          success: true,
          token: expect.any(String),
          user: expectedUserData,
          expiresIn: '12h',
        });
      } else {
        expect(body).toEqual({
          success: true,
          token: expect.any(String),
          user: { email: MOCK_USER.email },
          loginStatus: LOGIN_STATUSES.VALID_USERNAME_AND_PASSWORD,
          expiresIn: '105m',
        });
      }
    });
  });

  // TODO DTFS2-6680: remove this feature flag check
  if (FEATURE_FLAGS.MAGIC_LINK) {
    describe('POST /v1/users/me/sign-in-link/:signInToken/login', () => {
      let token;
      let signInToken;
      let userId;
      beforeEach(async () => {
        const response = await createUser(MOCK_USER);
        const createdUser = response.body.user;
        ({ userId, token, signInToken } = await createPartiallyLoggedInUserSession(createdUser));
      });

      describe('a known user with an email link', () => {
        it('can successfully log in', async () => {
          const { status, body } = await as({ ...MOCK_USER, token })
            .post()
            .to(`/v1/users/me/sign-in-link/${signInToken}/login`);

          const expectedUserData = {
            ...MOCK_USER,
            _id: expect.any(String),
            timezone: 'Europe/London',
            'user-status': 'active',
          };
          delete expectedUserData.password;

          expect(status).toEqual(200);
          expect(body).toEqual({
            success: true,
            token: expect.any(String),
            user: expectedUserData,
            loginStatus: LOGIN_STATUSES.VALID_2FA,
            expiresIn: '12h',
          });
        });
      });

      describe('a known user with an email link without a token', () => {
        it('cannot successfully log in', async () => {
          const { status } = await as({ ...MOCK_USER })
            .post()
            .to(`/v1/users/me/sign-in-link/${signInToken}/login`);

          expect(status).toEqual(401);
        });
      });

      describe('a known user with an incorrect sign in token', () => {
        it('cannot successfully log in', async () => {
          const { status, body } = await as({ ...MOCK_USER, token })
            .post()
            .to('/v1/users/me/sign-in-link/123/login');

          expect(status).toEqual(403);
          expect(body).toEqual({ error: 'Forbidden', message: `Invalid sign in token for user ID: ${userId}` });
        });
      });
    });

    describe('NoSQL injection attempts', () => {
      const expectedBody = { msg: 'email or password is incorrect', success: false };

      const injectionUsernames = ['{$or: [{role: { $ne: "" }}]}', '{ "$ne": "" }', '{ "$gt": "" }', '{ "$lt": "" }'];

      describe.each(injectionUsernames)('when username is "%s"', (username) => {
        it('should return a user cannot be found message', async () => {
          const { password } = MOCK_USER;
          const injectedUser = {
            ...MOCK_USER,
            username,
            email: username,
          };

          await createUser(injectedUser);

          const { status, body } = await as().post({ username, password }).to('/v1/login');

          expect(status).toEqual(401);
          expect(body).toEqual(expectedBody);
        });
      });
    });
  }

  describe('GET /v1/validate', () => {
    it('a token from a fully logged in user can be validated', async () => {
      await createUser(MOCK_USER);

      let token;
      if (FEATURE_FLAGS.MAGIC_LINK) {
        ({ token } = await createLoggedInUserSession(MOCK_USER));
      } else {
        const { username, password } = MOCK_USER;
        const { body: loginBody } = await as().post({ username, password }).to('/v1/login');
        token = loginBody.token;
      }

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(200);
    });

    // TODO DTFS2-6680: remove this feature flag check
    if (FEATURE_FLAGS.MAGIC_LINK) {
      it('a token from a partially logged in user cannot be validated', async () => {
        await createUser(MOCK_USER);

        const { token } = await createPartiallyLoggedInUserSession(MOCK_USER);

        const { status } = await as({ token }).get('/v1/validate');

        expect(status).toEqual(401);
      });
    }

    it('invalid tokens fail validation', async () => {
      const token = 'some characters i think maybe look like a token';

      const { status } = await as({ token }).get('/v1/validate');

      expect(status).toEqual(401);
    });
  });

  async function createUser(userToCreate) {
    return as(loggedInUser).post(userToCreate).to('/v1/users');
  }
});
