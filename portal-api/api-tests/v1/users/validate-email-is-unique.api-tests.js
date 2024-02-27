const { produce } = require('immer');
const { DB_COLLECTIONS } = require('../../fixtures/constants');
const users = require('./test-data');
const testUserCache = require('../../api-test-users');

const app = require('../../../src/createApp');
const { wipe } = require('../../database-helper');
const { ADMIN } = require('../../../src/v1/roles/roles');
const { as } = require('../../api')(app);

const withValidateEmailIsUniqueTests = ({ payload, makeRequest }) => {
  describe('when validating the email is unique', () => {
    let aNonAdmin;

    const EMAIL_MUST_BE_UNIQUE_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };
    const A_MATCHING_EMAIL = 'aMatchingEmail@ukexportfinance.gov.uk';
    const EXISTING_USER_WITH_SAME_EMAIL = produce(users.barclaysBankMaker1, (draftUser) => {
      draftUser.username = A_MATCHING_EMAIL;
      draftUser.email = A_MATCHING_EMAIL;
    });

    beforeEach(async () => {
      await wipe([DB_COLLECTIONS.USERS]);
      const testUsers = await testUserCache.initialise(app);
      aNonAdmin = testUsers().withoutRole(ADMIN).one();
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
      expect(body.errors.errorList.email.text).toEqual(EMAIL_MUST_BE_UNIQUE_ERROR);
    });

    async function createUser(userToCreate) {
      return as(aNonAdmin).post(userToCreate).to('/v1/users');
    }
  });
};

module.exports = { withValidateEmailIsUniqueTests };
