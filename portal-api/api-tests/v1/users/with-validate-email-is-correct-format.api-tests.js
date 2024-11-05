const withValidateEmailIsCorrectFormatTests = ({ createPayloadWithUpdatedEmailAddress, makeRequest }) => {
  describe('when validating the email is correctly formatted', () => {
    const EMAIL_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };
    const AN_INVALID_EMAIL_ADDRESS = 'notAValidEmailAddress';
    const AN_EMPTY_STRING = '';
    const AN_OBJECT = { aField: 'AString' };
    const AN_EMPTY_OBJECT = {};

    const errorTestCases = [
      {
        description: `is an invalid email address`,
        valueToSetField: AN_INVALID_EMAIL_ADDRESS,
      },
      {
        description: `is an empty string`,
        valueToSetField: AN_EMPTY_STRING,
      },
      {
        description: `is an empty object`,
        valueToSetField: AN_EMPTY_OBJECT,
      },
      {
        description: `is an object`,
        valueToSetField: AN_OBJECT,
      },
    ];
    describe('when validating the email', () => {
      it.each(errorTestCases)(`rejects if the provided email $description`, async ({ valueToSetField }) => {
        const request = createPayloadWithUpdatedEmailAddress(valueToSetField);

        const { status, body } = await makeRequest(request);

        expect(status).toEqual(400);
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.email.text).toEqual(EMAIL_ERROR.text);
      });
    });
  });
};

module.exports = { withValidateEmailIsCorrectFormatTests };
