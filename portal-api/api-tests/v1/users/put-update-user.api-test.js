/* eslint-disable no-param-reassign */
const { produce } = require('immer');

const databaseHelper = require('../../database-helper');
const testUserCache = require('../../api-test-users');

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const users = require('./test-data');
const { READ_ONLY, MAKER, CHECKER } = require('../../../src/v1/roles/roles');
const { NON_READ_ONLY_ROLES } = require('../../../test-helpers/common-role-lists');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { STATUS } = require('../../../src/constants/user');
const { withValidateUsernameAndEmailMatchTests } = require('./with-validate-username-and-email-match.api-tests');
const { withValidateEmailIsCorrectFormatTests } = require('./with-validate-email-is-correct-format.api-tests');
const { withValidateEmailIsUniqueTests } = require('./with-validate-email-is-unique.api-tests');
const { withValidatePasswordWhenUpdateUserWithoutCurrentPasswordTests } = require('./with-validate-password.api-tests');

const temporaryUsernameAndEmail = 'temporary_user@ukexportfinance.gov.uk';
const MOCK_USER = {
  ...users.barclaysBankMaker1,
  username: temporaryUsernameAndEmail,
  email: temporaryUsernameAndEmail,
};

const READ_ONLY_ROLE_EXCLUSIVE_ERROR = { text: "You cannot combine 'Read-only' with any of the other roles" };

const BASE_URL = '/v1/users';

describe('a user', () => {
  let aNonAdmin;
  let anAdmin;
  let createdUser;

  const A_MATCHING_EMAIL_ADDRESS = 'aMatchingEmailAddress@ukexportfinance.gov.uk';

  beforeAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
    const testUsers = await testUserCache.initialise(app);
    anAdmin = testUsers().withRole(ADMIN).one();
    aNonAdmin = testUsers().withoutRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.deleteUser(MOCK_USER);

    const response = await createUser(MOCK_USER);
    createdUser = response.body.user;
  });

  afterAll(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.USERS]);
  });

  describe('PUT /v1/users', () => {
    describe('as admin', () => {
      it("a user's details can be updated", async () => {
        const updatedUserCredentials = {
          roles: [CHECKER, MAKER],
          firstname: 'NEW_FIRSTNAME',
          surname: 'NEW_SURNAME',
          'user-status': STATUS.BLOCKED,
        };

        const { status } = await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(200);

        const { body } = await as(anAdmin).get(`/v1/users/${createdUser._id}`);

        expect(body).toEqual(
          expect.objectContaining({
            roles: [CHECKER, MAKER],
            firstname: 'NEW_FIRSTNAME',
            surname: 'NEW_SURNAME',
            'user-status': STATUS.BLOCKED,
          }),
        );
      });

      it("a user's password can be updated", async () => {
        const updatedUserCredentials = {
          password: 'AbC1234!',
          passwordConfirm: 'AbC1234!',
        };

        const { status } = await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(200);
      });

      it.each(NON_READ_ONLY_ROLES)('rejects if the user update request has the read-only role with the %s role', async (otherRole) => {
        const updatedUserCredentials = {
          roles: [READ_ONLY, otherRole],
        };

        const { status, body } = await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(400);
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.roles).toStrictEqual(READ_ONLY_ROLE_EXCLUSIVE_ERROR);
      });

      it('updates the user if the user update request has the read-only role only', async () => {
        const updatedUserCredentials = {
          roles: [READ_ONLY],
        };

        await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        const { status, body } = await as(anAdmin).get(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(200);
        expect(body.roles).toEqual([READ_ONLY]);
      });

      it('updates the user if the user update request has the read-only role repeated', async () => {
        const updatedUserCredentials = {
          roles: [READ_ONLY, READ_ONLY],
        };

        await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        const { status, body } = await as(anAdmin).get(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(200);
        expect(body.roles).toStrictEqual([READ_ONLY, READ_ONLY]);
      });

      withValidatePasswordWhenUpdateUserWithoutCurrentPasswordTests({
        payload: {},
        makeRequest: async (updatedUserCredentials) => await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`),
        existingUserPassword: MOCK_USER.password,
      });

      withValidateEmailIsUniqueTests({
        payload: { roles: [READ_ONLY] },
        makeRequest: async (updatedUserCredentials) => await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`),
        getAdminUser: () => anAdmin,
      });

      withValidateUsernameAndEmailMatchTests({
        createPayloadWithUpdatedEmailAddress: (email) =>
          produce({}, (draftRequest) => {
            draftRequest.email = email;
          }),
        makeRequest: async (updatedUserCredentials) => await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`),
      });

      withValidateEmailIsCorrectFormatTests({
        createPayloadWithUpdatedEmailAddress: (email) =>
          produce({}, (draftRequest) => {
            draftRequest.username = email;
            draftRequest.email = email;
          }),
        makeRequest: async (updatedUserCredentials) => await as(anAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`),
      });
    });

    describe('as non-admin', () => {
      it('a user can update their own password', async () => {
        const updatedUserCredentials = {
          currentPassword: 'AbC!2345',
          password: 'AbC1234!',
          passwordConfirm: 'AbC1234!',
        };

        await as(createdUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        const { status } = await as(aNonAdmin).get(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(200);
        // Should check new password works
      });

      it('a user cannot update their role', async () => {
        const updatedUserCredentials = {
          roles: [CHECKER, MAKER],
        };

        await as(createdUser).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        const { status, body } = await as(aNonAdmin).get(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(200);
        expect(body.roles).toEqual(MOCK_USER.roles);
      });

      it('a non-admin cannot change someone elses password', async () => {
        const updatedUserCredentials = {
          currentPassword: 'AbC!2345',
          password: 'AbC1234!',
          passwordConfirm: 'AbC1234!',
        };

        const { status } = await as(aNonAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(403);
      });

      it('a non-admin cannot update their username', async () => {
        const updatedUserCredentials = {
          username: A_MATCHING_EMAIL_ADDRESS,
          email: A_MATCHING_EMAIL_ADDRESS,
        };

        const { status } = await as(aNonAdmin).put(updatedUserCredentials).to(`/v1/users/${createdUser._id}`);

        expect(status).toEqual(403);
      });
    });
  });

  async function createUser(userToCreate) {
    return as(aNonAdmin).post(userToCreate).to(BASE_URL);
  }
});
