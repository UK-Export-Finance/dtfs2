const { produce } = require('immer');

const PASSWORD_ERROR = {
  text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.',
};

const A_VALID_PASSWORD = 'AValidPassword1!';

const ANOTHER_VALID_PASSWORD = 'AnotherValidPassword1!';

const WHEN_VALIDATING_PASSWORD_TEXT = 'when validating password';

const withValidatePasswordOnCreateUserTests = ({ payload, makeRequest }) => {
  describe(WHEN_VALIDATING_PASSWORD_TEXT, () => {
    itShouldReturnAnErrorIf(getCreatePasswordRuleTestCases({ payload, makeRequest }));
  });
};

const withValidatePasswordOnUpdateUserTests = ({ payload, makeRequest, existingUserPassword }) => {
  describe(WHEN_VALIDATING_PASSWORD_TEXT, () => {
    itShouldReturnAnErrorIf(getUpdateUserRuleTestCases({ payload, makeRequest, existingUserPassword }));
  });
};

function getCreatePasswordRuleTestCases({ makeRequest, payload }) {
  return [
    {
      description: 'the password is less than 8 characters',
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: 'aA1!' })),
    },
    {
      description: 'the password does not have at least one number',
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: 'APassword!' })),
    },
    {
      description: 'the password does not have at least one upper-case character',
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: 'apassword!123' })),
    },
    {
      description: 'the password does not have at least one lower-case character',
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: 'APASSWORD!123' })),
    },
    {
      description: 'the password does not have at least one special character',
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: 'APASSWORD123' })),
    },
  ];
}

function getUpdateUserRuleTestCases({ makeRequest, payload, existingUserPassword }) {
  const updateSpecificTestCases = [
    {
      description: 'the password does not match the password confirmation',
      makeRequestWithModifiedPayload: async () =>
        await makeRequest(
          produce(payload, (draftRequest) => {
            draftRequest.password = A_VALID_PASSWORD;
            draftRequest.passwordConfirm = ANOTHER_VALID_PASSWORD;
          }),
        ),
      expectResponseErrorToMatchExpected: (body) => expect(body.errors.errorList.passwordConfirm.text).toEqual('Your passwords must match.'),
    },
    {
      description: 'the password matches the existing password',
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: existingUserPassword })),
    },
    {
      description: 'the provided the current password does not match the current password in the database',
      makeRequestWithModifiedPayload: async () =>
        await makeRequest(
          produce(payload, (draftRequest) => {
            draftRequest.password = A_VALID_PASSWORD;
            draftRequest.passwordConfirm = ANOTHER_VALID_PASSWORD;
            draftRequest.currentPassword = 'ThisIsNotTheCurrentPassword';
          }),
        ),
      expectResponseErrorToMatchExpected: (body) =>
        expect(body.errors.errorList.currentPassword.text).toEqual('Current password is not correct.'),
    },
  ];
  return [...getCreatePasswordRuleTestCases({ makeRequest, payload }), ...updateSpecificTestCases];
}

function itShouldReturnAnErrorIf(testCases) {
  it.each(testCases)(
    'should return an error if $description',
    async ({
      makeRequestWithModifiedPayload,
      expectResponseErrorToMatchExpected = (body) => expect(body.errors.errorList.password).toEqual(PASSWORD_ERROR),
    }) => {
      const { status, body } = await makeRequestWithModifiedPayload();

      expect(status).toEqual(400);
      expect(body.success).toEqual(false);
      expectResponseErrorToMatchExpected(body);
    },
  );
}

function replacePassword({ payload, replacementPassword }) {
  return produce(payload, (draftRequest) => {
    draftRequest.password = replacementPassword;
    draftRequest.passwordConfirm = replacementPassword;
  });
}

module.exports = { withValidatePasswordOnCreateUserTests, withValidatePasswordOnUpdateUserTests };
