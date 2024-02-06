const databaseHelper = require('../../database-helper');
const testUserCache = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as, post } = require('../../api')(app);

const users = require('./test-data');
const { READ_ONLY } = require('../../../src/v1/roles/roles');
const { NON_READ_ONLY_ROLES } = require('../../../test-helpers/common-role-lists');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { STATUS } = require('../../../src/constants/user');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');

const MOCK_USER = users.barclaysBankMaker1;

const PASSWORD_ERROR = {
  text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.',
};
const EMAIL_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };
const READ_ONLY_ROLE_EXCLUSIVE_ERROR = { text: "You cannot combine 'Read-only' with any of the other roles" };
const USERNAME_AND_EMAIL_MUST_MATCH_ERROR = { text: 'Username and email must match' };

const BASE_URL = '/v1/users';
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

  describe('POST /v1/users', () => {
    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => post(BASE_URL, MOCK_USER),
      makeRequestWithAuthHeader: (authHeader) => post(BASE_URL, MOCK_USER, { headers: { Authorization: authHeader } }),
    });

    describe('when validating the password', () => {
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
    });

    describe('validating the email address', () => {
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

      it('rejects if the provided email address does not match the provided username', async () => {
        const newUser = {
          ...MOCK_USER,
          username: '',
        };

        const { status, body } = await createUser(newUser);

        expect(status).toEqual(400);
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.email.text).toEqual(USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text);
      });
    });

    describe('when a user already exists', () => {
      it('returns a 400', async () => {
        // User creation - first instance
        const first = await createUser(MOCK_USER);
        expect(first.status).toEqual(200);

        // User creation - second instance
        const second = await createUser(MOCK_USER);
        expect(second.status).toEqual(400);
      });
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

    describe('it creates the user', () => {
      it('it creates the user if all provided data is valid', async () => {
        await createUser(MOCK_USER);
        const { status, body } = await as(aNonAdmin).get(BASE_URL);

        expect(status).toEqual(200);
        expect(body).toStrictEqual(
          expect.objectContaining({
            success: true,
            users: expect.arrayContaining([
              {
                username: MOCK_USER.username,
                email: MOCK_USER.email,
                roles: MOCK_USER.roles,
                bank: MOCK_USER.bank,
                _id: expect.any(String),
                firstname: MOCK_USER.firstname,
                surname: MOCK_USER.surname,
                timezone: 'Europe/London',
                'user-status': STATUS.ACTIVE,
              },
            ]),
          }),
        );
      });

      it('it creates the user if the user creation request has the read-only role repeated', async () => {
        const newUser = {
          ...MOCK_USER,
          roles: [READ_ONLY, READ_ONLY],
        };

        await createUser(newUser);
        const { status, body } = await as(aNonAdmin).get(BASE_URL);

        expect(status).toEqual(200);
        expect(body.users.find((user) => user.username === MOCK_USER.username).roles).toStrictEqual([READ_ONLY, READ_ONLY]);
      });

      it('it creates the user if the user creation request has the read-only role only', async () => {
        const newUser = {
          ...MOCK_USER,
          roles: [READ_ONLY],
        };

        await createUser(newUser);
        const { status, body } = await as(aNonAdmin).get(BASE_URL);

        expect(status).toEqual(200);
        expect(body.users.find((user) => user.username === MOCK_USER.username).roles).toStrictEqual([READ_ONLY]);
      });
    });
  });

  async function createUser(userToCreate) {
    return as(aNonAdmin).post(userToCreate).to(BASE_URL);
  }
});
