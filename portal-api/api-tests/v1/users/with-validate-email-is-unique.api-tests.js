const { produce } = require('immer');
const users = require('./test-data');
const databaseHelper = require('../../database-helper');
const { createUser } = require('../../helpers/create-user');

const withValidateEmailIsUniqueTests = ({ payload, makeRequest, getAdminUser }) => {
  describe('when validating the email is unique', () => {
    const EMAIL_MUST_BE_UNIQUE_ERROR = { text: 'Email address already in use' };
    const A_MATCHING_EMAIL = 'aMatchingEmail@ukexportfinance.gov.uk';
    const EXISTING_USER_WITH_SAME_EMAIL = produce(users.testBank1Maker1, (draftUser) => {
      draftUser.username = A_MATCHING_EMAIL;
      draftUser.email = A_MATCHING_EMAIL;
    });

    beforeEach(async () => {
      await databaseHelper.deleteUser(EXISTING_USER_WITH_SAME_EMAIL);
    });

    afterAll(async () => {
      await databaseHelper.deleteUser(EXISTING_USER_WITH_SAME_EMAIL);
    });

    it('rejects if the provided email address exists in the database', async () => {
      const payloadWithMatchingEmail = produce(payload, (draftRequest) => {
        draftRequest.username = A_MATCHING_EMAIL;
        draftRequest.email = A_MATCHING_EMAIL;
      });

      await createUser(EXISTING_USER_WITH_SAME_EMAIL, getAdminUser());

      const { status, body } = await makeRequest(payloadWithMatchingEmail);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(EMAIL_MUST_BE_UNIQUE_ERROR.text);
    });
  });
};

module.exports = { withValidateEmailIsUniqueTests };
