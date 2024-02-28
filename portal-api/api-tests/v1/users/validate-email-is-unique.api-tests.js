const { produce } = require('immer');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const users = require('./test-data');
const testUserCache = require('../../api-test-users');
const databaseHelper = require('../../database-helper');

const app = require('../../../src/createApp');
const { wipe } = require('../../database-helper');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { as } = require('../../api')(app);

const withValidateEmailIsUniqueTests = ({ payload, makeRequest }) => {
  describe('when validating the email is unique', () => {
    let anAdmin;

    const EMAIL_MUST_BE_UNIQUE_ERROR = { text: 'Email address already in use' };
    const A_MATCHING_EMAIL = 'aMatchingEmail@ukexportfinance.gov.uk';
    const EXISTING_USER_WITH_SAME_EMAIL = produce(users.barclaysBankMaker1, (draftUser) => {
      draftUser.username = A_MATCHING_EMAIL;
      draftUser.email = A_MATCHING_EMAIL;
    });

    beforeAll(async () => {
      const testUsers = await testUserCache.initialise(app);
      anAdmin = testUsers().withRole(ADMIN).one();
    });

    beforeEach(async () => {
      await databaseHelper.deleteUser(EXISTING_USER_WITH_SAME_EMAIL);
    });

    afterAll(async () => {
      await wipe([DB_COLLECTIONS.USERS]);
    });

    it('rejects if the provided email address exists in the database', async () => {
      const payloadWithMatchingEmail = produce(payload, (draftRequest) => {
        draftRequest.username = A_MATCHING_EMAIL;
        draftRequest.email = A_MATCHING_EMAIL;
      });

      await createUser(EXISTING_USER_WITH_SAME_EMAIL);

      const { status, body } = await makeRequest(payloadWithMatchingEmail);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_MUST_BE_UNIQUE_ERROR.text);
    });

    async function createUser(userToCreate) {
      return as(anAdmin).post(userToCreate).to('/v1/users');
    }
  });
};

module.exports = { withValidateEmailIsUniqueTests };
