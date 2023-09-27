const wipeDB = require('../../wipeDB');
const { setUpApiTestUser } = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const users = require('./test-data');
const { READ_ONLY, MAKER, CHECKER } = require('../../../src/v1/roles/roles');
const { NON_READ_ONLY_ROLES } = require('../../../test-helpers/common-role-lists');

const aMaker = users.find((user) => user.username === 'MAKER');
const MOCK_USER = { ...aMaker, username: 'TEMPORARY_USER' };

const PASSWORD_ERROR = { text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.' };
const EMAIL_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };
const READ_ONLY_ROLE_EXCLUSIVE_ERROR = { text: "You cannot combine 'Read-only' with any of the other roles" };

describe('a user', () => {
  let loggedInUser;

  beforeAll(async () => {
    await wipeDB.wipe(['users']);
    loggedInUser = await setUpApiTestUser(as);
  });

  beforeEach(async () => {
    wipeDB.deleteUser(MOCK_USER);
  });

  describe('creating a user:', () => {
    it('rejects if the provided password contains zero numeric characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: 'No-numeric-characters',
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero upper-case characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '0-upper-case-characters',
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero lower-case characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '0-LOWER-CASE-CHARACTERS',
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains zero special characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '0specialCharacters',
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided password contains fewer than 8 characters', async () => {
      const newUser = {
        ...MOCK_USER,
        password: '1234567',
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR);
    });

    it('rejects if the provided email address is not in valid format', async () => {
      const newUser = {
        ...MOCK_USER,
        email: 'abc'
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
    });

    it('rejects if the provided email address is empty', async () => {
      const newUser = {
        ...MOCK_USER,
        email: ''
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
    });

    it('creates the user if all provided data is valid', async () => {
      await as(loggedInUser).post(MOCK_USER).to('/v1/users');
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

    it.each(NON_READ_ONLY_ROLES)('rejects if the user creation request has the read-only role and the %s role', async (otherRole) => {
      const newUser = {
        ...MOCK_USER,
        roles: [
          READ_ONLY,
          otherRole,
        ]
      };

      const { status, body } = await as(loggedInUser).post(newUser).to('/v1/users');

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.roles).toStrictEqual(READ_ONLY_ROLE_EXCLUSIVE_ERROR);
    });

    it('creates the user if the user creation request has the read-only role repeated', async () => {
      const newUser = {
        ...MOCK_USER,
        roles: [
          READ_ONLY,
          READ_ONLY,
        ]
      };

      await as(loggedInUser).post(newUser).to('/v1/users');
      const { status, body } = await as(loggedInUser).get('/v1/users');

      expect(status).toEqual(200);
      expect(body.users[1].roles).toStrictEqual([READ_ONLY, READ_ONLY]);
    });

    it('creates the user the user creation request has the read-only role only', async () => {
      const newUser = {
        ...MOCK_USER,
        roles: [
          READ_ONLY,
        ]
      };

      await as(loggedInUser).post(newUser).to('/v1/users');
      const { status, body } = await as(loggedInUser).get('/v1/users');

      expect(status).toEqual(200);
      expect(body.users[1].roles).toStrictEqual([READ_ONLY]);
    });
  });

  describe('updating a user', () => {
    it('a user can be updated', async () => {
      const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
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
      const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
      const createdUser = response.body.user;

      const updatedUserCredentials = {
        roles: [
          READ_ONLY,
          otherRole,
        ],
      };

      const { status, body } = await as(loggedInUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.roles).toStrictEqual(READ_ONLY_ROLE_EXCLUSIVE_ERROR);
    });

    it('updates the user if the user update request has the read-only role only', async () => {
      const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
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
      const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
      const createdUser = response.body.user;

      const updatedUserCredentials = {
        roles: [
          READ_ONLY,
          READ_ONLY,
        ]
      };

      await as(loggedInUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

      const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

      expect(status).toEqual(200);
      expect(body.roles).toStrictEqual([READ_ONLY, READ_ONLY]);
    });
  });

  it('a user can be deleted', async () => {
    const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    const createdUser = response.body.user;

    await as(loggedInUser).remove(`/v1/users/${createdUser._id}`);

    const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('a user can be disabled', async () => {
    const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    const createdUser = response.body.user;

    await as(loggedInUser).remove(`/v1/users/${createdUser._id}/disable`);

    const { status, body } = await as(loggedInUser).get(`/v1/users/${createdUser._id}`);

    expect(status).toEqual(200);
    expect(body).toMatchObject({
      disabled: true,
    });
  });

  it('an unknown user cannot log in', async () => {
    const { username, password } = MOCK_USER;
    const { status } = await as().post({ username, password }).to('/v1/login');

    expect(status).toEqual(401);
  });

  it('a disabled user cannot log in', async () => {
    const response = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    const createdUser = response.body.user;
    await as(loggedInUser).remove(`/v1/users/${createdUser._id}`);

    const { username, password } = MOCK_USER;
    const { status } = await as().post({ username, password }).to('/v1/login');

    expect(status).toEqual(401);
  });

  it('a known user can log in', async () => {
    const { username, password } = MOCK_USER;
    await as(loggedInUser).post(MOCK_USER).to('/v1/users');

    const { status, body } = await as().post({ username, password }).to('/v1/login');

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
      expiresIn: '12h',
    });
  });

  it('a token can be validated', async () => {
    const { username, password } = MOCK_USER;
    await as(loggedInUser).post(MOCK_USER).to('/v1/users');

    const loginResult = await as().post({ username, password }).to('/v1/login');

    const { token } = loginResult.body;

    const { status } = await as({ token }).get('/v1/validate');

    expect(status).toEqual(200);
  });

  it('invalid tokens fail validation', async () => {
    const token = 'some characters i think maybe look like a token';

    const { status } = await as({ token }).get('/v1/validate');

    expect(status).toEqual(401);
  });

  it('User already exists', async () => {
    // User creation - first instance
    const first = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    expect(first.status).toEqual(200);

    // User creation - second instance
    const second = await as(loggedInUser).post(MOCK_USER).to('/v1/users');
    expect(second.status).toEqual(400);
  });

  const expectedBody = { msg: 'email or password incorrect', success: false };

  describe('Attempting to login with NoSQL injection ', () => {
    it('should return a user cannot be found message', async () => {
      const username = "{$or: [{role: { $ne: '' }}]}";
      const { password } = MOCK_USER;

      const { status, body } = await as().post({ username, password }).to('/v1/login');

      expect(status).toEqual(401);
      expect(body).toEqual(expectedBody);
    });
  });

  describe('NoSQL injection attempts', () => {
    describe('when username is "{ "$ne": "" }"', () => {
      it('should return a user cannot be found message', async () => {
        const injectedUser = {
          ...MOCK_USER,
          username: '{ "$ne": "" }',
          email: '{ "$ne": "" }',
        };

        const { username, password } = injectedUser;
        await as(loggedInUser).post(injectedUser).to('/v1/users');

        const { status, body } = await as().post({ username, password }).to('/v1/login');

        expect(status).toEqual(401);
        expect(body).toEqual(expectedBody);
      });
    });

    describe('when username is "{ "$gt": "" }"', () => {
      it('should return a user cannot be found message', async () => {
        const injectedUser = {
          ...MOCK_USER,
          username: '{ "$gt": "" }',
          email: '{ "$gt": "" }',
        };

        const { username, password } = injectedUser;
        await as(loggedInUser).post(injectedUser).to('/v1/users');

        const { status, body } = await as().post({ username, password }).to('/v1/login');

        expect(status).toEqual(401);
        expect(body).toEqual(expectedBody);
      });

      describe('when username is "{ "$lt": "" }"', () => {
        it('should return a user cannot be found message', async () => {
          const injectedUser = {
            ...MOCK_USER,
            username: '{ "$lt": "" }',
            email: '{ "$lt": "" }',
          };

          const { username, password } = injectedUser;
          await as(loggedInUser).post(injectedUser).to('/v1/users');

          const { status, body } = await as().post({ username, password }).to('/v1/login');

          expect(status).toEqual(401);
          expect(body).toEqual(expectedBody);
        });
      });
    });
  });
});
