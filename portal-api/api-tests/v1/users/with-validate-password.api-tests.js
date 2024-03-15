const { produce } = require('immer');

const PASSWORD_ERROR = {
  text: 'Your password must be at least 8 characters long and include at least one number, at least one upper-case character, at least one lower-case character and at least one special character. Passwords cannot be re-used.',
};

const A_VALID_PASSWORD = 'AValidPassword1!';

const ANOTHER_VALID_PASSWORD = 'AnotherValidPassword1!';

const WHEN_VALIDATING_PASSWORD_TEXT = 'when validating password';

/*
 * The following tests are for the password validation rules
 * that are applied when creating a new user.
 * These rule test cases correspond to the createRules in the validation/index.js file
 */
const withValidatePasswordWhenCreatingUserTests = ({ payload, makeRequest }) => {
  describe(WHEN_VALIDATING_PASSWORD_TEXT, () => {
    itShouldReturnAnErrorIf(getCreatePasswordRuleTestCases({ payload, makeRequest }));
  });
};

/*
 * The following tests are for the password validation rules
 * that are applied when updating a user without providing the current password.
 * These rule test cases correspond to the applyUpdateRules in the validation/index.js file
 * when the current password field is not provided.
 */
const withValidatePasswordWhenUpdateUserWithoutCurrentPasswordTests = ({ payload, makeRequest, existingUserPassword }) => {
  describe(WHEN_VALIDATING_PASSWORD_TEXT, () => {
    itShouldReturnAnErrorIf(getUpdateUserRuleWithoutCurrentPasswordTestCases({ payload, makeRequest, existingUserPassword }));
  });
};

/*
 * The following tests are for the password validation rules
 * that are applied when updating a user with providing the current password.
 * These rule test cases correspond to the applyUpdateRules in the validation/index.js file
 * when the current password field is provided.
 */
const withValidatePasswordWhenUpdateUserWithCurrentPasswordTests = ({ payload, makeRequest, existingUserPassword }) => {
  describe(WHEN_VALIDATING_PASSWORD_TEXT, () => {
    itShouldReturnAnErrorIf(getUpdateUserRuleWithCurrentPasswordTestCases({ payload, makeRequest, existingUserPassword }));
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
      makeRequestWithModifiedPayload: async () => await makeRequest(replacePassword({ payload, replacementPassword: 'APassword123' })),
    },
  ];
}

function getUpdateUserRuleWithoutCurrentPasswordTestCases({ makeRequest, payload, existingUserPassword }) {
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
  ];
  return [...getCreatePasswordRuleTestCases({ makeRequest, payload }), ...updateSpecificTestCases];
}

function getUpdateUserRuleWithCurrentPasswordTestCases({ makeRequest, payload, existingUserPassword }) {
  const updateWithCurrentPasswordSpecificTestCases = [
    {
      description: 'the provided the current password does not match the current password in the database',
      makeRequestWithModifiedPayload: async () =>
        await makeRequest(
          produce(payload, (draftRequest) => {
            draftRequest.password = A_VALID_PASSWORD;
            draftRequest.passwordConfirm = A_VALID_PASSWORD;
            draftRequest.currentPassword = 'ThisIsNotTheCurrentPassword';
          }),
        ),
      expectResponseErrorToMatchExpected: (body) => expect(body.errors.errorList.currentPassword.text).toEqual('Current password is not correct.'),
    },
  ];
  return [getUpdateUserRuleWithoutCurrentPasswordTestCases({ makeRequest, payload, existingUserPassword }), ...updateWithCurrentPasswordSpecificTestCases];
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

module.exports = {
  withValidatePasswordWhenCreatingUserTests,
  withValidatePasswordWhenUpdateUserWithoutCurrentPasswordTests,
  withValidatePasswordWhenUpdateUserWithCurrentPasswordTests,
};
