const withValidateUsernameAndEmailMatchTests = ({ createPayloadWithUpdatedEmailAddress, makeRequest }) => {
  describe('when validating the email and username match', () => {
    const USERNAME_AND_EMAIL_MUST_MATCH_ERROR = { text: 'Username and email must match' };
    const A_DIFFERENT_EMAIL_ADDRESS = 'ADifferentEmailAddress@ukexportfinance.gov.uk';

    it('rejects if the provided email and username do not match', async () => {
      const request = createPayloadWithUpdatedEmailAddress(A_DIFFERENT_EMAIL_ADDRESS);

      const { status, body } = await makeRequest(request);

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expect(body.errors.errorList.email.text).toEqual(USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text);
    });
  });
};

module.exports = { withValidateUsernameAndEmailMatchTests };
