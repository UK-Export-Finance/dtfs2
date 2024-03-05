const withValidateUsernameAndEmailTests = ({ createRequestBodyWithUpdatedField, makeRequest }) =>
  describe('when validating the email and username', () => {
    const EMAIL_ERROR = { text: 'Enter an email address in the correct format, for example, name@example.com' };
    const USERNAME_AND_EMAIL_MUST_MATCH_ERROR = { text: 'Username and email must match' };
    const A_DIFFERENT_EMAIL_ADDRESS = 'ADifferentEmailAddress@ukexportfinance.gov.uk';
    const AN_INVALID_EMAIL_ADDRESS = 'notAValidEmailAddress';
    const AN_EMPTY_STRING = '';
    const AN_OBJECT = { aField: 'AString' };
    const AN_EMPTY_OBJECT = {};

    const errorTestCases = [
      {
        description: `is a different email address`,
        valueToSetField: A_DIFFERENT_EMAIL_ADDRESS,
        expectedErrorForEmailTests: USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text,
        expectedErrorForUsernameTests: USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text,
      },
      {
        description: `is an invalid email address`,
        valueToSetField: AN_INVALID_EMAIL_ADDRESS,
        expectedErrorForEmailTests: EMAIL_ERROR.text,
        expectedErrorForUsernameTests: USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text,
      },
      {
        description: `is an empty string`,
        valueToSetField: AN_EMPTY_STRING,
        expectedErrorForEmailTests: EMAIL_ERROR.text,
        expectedErrorForUsernameTests: USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text,
      },
      {
        description: `is an empty object`,
        valueToSetField: AN_EMPTY_OBJECT,
        expectedErrorForEmailTests: EMAIL_ERROR.text,
        expectedErrorForUsernameTests: USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text,
      },
      {
        description: `is an object`,
        valueToSetField: AN_OBJECT,
        expectedErrorForEmailTests: EMAIL_ERROR.text,
        expectedErrorForUsernameTests: USERNAME_AND_EMAIL_MUST_MATCH_ERROR.text,
      },
    ];
    describe('when validating the email', () => {
      it.each(errorTestCases)(
        `rejects if the provided email $description (error: $expectedErrorForEmailTests)`,
        async ({ valueToSetField, expectedErrorForEmailTests }) => {
          const request = createRequestBodyWithUpdatedField({ fieldToUpdate: 'email', valueToSetField });

          const { status, body } = await makeRequest(request);

          expect(status).toEqual(400);
          expect(body.success).toEqual(false);
          expect(body.errors.errorList.email.text).toEqual(expectedErrorForEmailTests);
        },
      );
    });

    describe('when validating the username', () => {
      it.each(errorTestCases)(
        `rejects if the provided username $description (error: $expectedErrorForUsernameTests)`,
        async ({ valueToSetField, expectedErrorForUsernameTests }) => {
          const request = createRequestBodyWithUpdatedField({ fieldToUpdate: 'username', valueToSetField });

          const { status, body } = await makeRequest(request);

          expect(status).toEqual(400);
          expect(body.success).toEqual(false);
          expect(body.errors.errorList.email.text).toEqual(expectedErrorForUsernameTests);
        },
      );
    });
  });

module.exports = withValidateUsernameAndEmailTests;
