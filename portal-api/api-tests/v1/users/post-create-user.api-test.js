const { produce } = require('immer');
const databaseHelper = require('../../database-helper');
const testUserCache = require('../../api-test-users');

const app = require('../../../server/createApp');
const { as, post } = require('../../api')(app);

const users = require('./test-data');
const { READ_ONLY } = require('../../../server/v1/roles/roles');
const { NON_READ_ONLY_ROLES } = require('../../../test-helpers/common-role-lists');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { ADMIN } = require('../../../server/v1/roles/roles');
const { STATUS } = require('../../../server/constants/user');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withValidateEmailIsUniqueTests } = require('./with-validate-email-is-unique.api-tests');
const { withValidateUsernameAndEmailMatchTests } = require('./with-validate-username-and-email-match.api-tests');
const { withValidateEmailIsCorrectFormatTests } = require('./with-validate-email-is-correct-format.api-tests');
const { createUser } = require('../../helpers/create-user');

const MOCK_USER = users.testBank1Maker1;

const READ_ONLY_ROLE_EXCLUSIVE_ERROR = { text: "You cannot combine 'Read-only' with any of the other roles" };

const BASE_URL = '/v1/users';
describe('a user', () => {
  let aNonAdmin;
  let anAdmin;

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    const testUsers = await testUserCache.initialise(app);
    aNonAdmin = testUsers().withoutRole(ADMIN).one();
    anAdmin = testUsers().withRole(ADMIN).one();
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

    withValidateEmailIsUniqueTests({
      payload: MOCK_USER,
      makeRequest: async (user) => await createUser(user, aNonAdmin),
      getAdminUser: () => anAdmin,
    });

    withValidateUsernameAndEmailMatchTests({
      createPayloadWithUpdatedEmailAddress: (email) =>
        produce(MOCK_USER, (draftRequest) => {
          draftRequest.email = email;
        }),
      makeRequest: async (user) => await createUser(user, aNonAdmin),
    });

    withValidateEmailIsCorrectFormatTests({
      createPayloadWithUpdatedEmailAddress: (email) =>
        produce(MOCK_USER, (draftRequest) => {
          draftRequest.username = email;
          draftRequest.email = email;
        }),
      makeRequest: async (user) => await createUser(user, aNonAdmin),
    });

    it.each(NON_READ_ONLY_ROLES)('rejects if the user creation request has the read-only role and the %s role', async (otherRole) => {
      const newUser = {
        ...MOCK_USER,
        roles: [READ_ONLY, otherRole],
      };

      const { status, body } = await createUser(newUser, aNonAdmin);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.roles).toStrictEqual(READ_ONLY_ROLE_EXCLUSIVE_ERROR);
    });

    describe('it creates the user', () => {
      it('creates the user if all provided data is valid', async () => {
        await createUser(MOCK_USER, aNonAdmin);
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
                isTrusted: MOCK_USER.isTrusted,
              },
            ]),
          }),
        );
      });

      it('creates the user if the user creation request has the read-only role repeated', async () => {
        const newUser = {
          ...MOCK_USER,
          roles: [READ_ONLY, READ_ONLY],
        };

        await createUser(newUser, aNonAdmin);
        const { status, body } = await as(aNonAdmin).get(BASE_URL);

        expect(status).toEqual(200);
        expect(body.users.find((user) => user.username === MOCK_USER.username).roles).toStrictEqual([READ_ONLY, READ_ONLY]);
      });

      it('creates the user if the user creation request has the read-only role only', async () => {
        const newUser = {
          ...MOCK_USER,
          roles: [READ_ONLY],
        };

        await createUser(newUser, aNonAdmin);
        const { status, body } = await as(aNonAdmin).get(BASE_URL);

        expect(status).toEqual(200);
        expect(body.users.find((user) => user.username === MOCK_USER.username).roles).toStrictEqual([READ_ONLY]);
      });
    });
  });
});
