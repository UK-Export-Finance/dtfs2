const { resetAllWhenMocks, when } = require('jest-when');
const {
  whenApplyingRulesItAppliesOnlyTheExpectedRules,
  whenNoRulesReturnAnErrorItReturnsAnEmptyArray,
  whenASingleRuleReturnsAnErrorItReturnsTheError,
  whenMultipleRulesReturnErrorsItReturnsAllErrors,
  whenASingleRuleThrowsAnUnhandledErrorItThrowsTheError,
} = require('../../../../test-helpers/unit-test-helpers/users/validation/user-validation.test-cases');

const passwordAtLeast8Characters = require('./rules/passwordAtLeast8Characters');
const passwordAtLeastOneNumber = require('./rules/passwordAtLeastOneNumber');
const passwordAtLeastOneUppercase = require('./rules/passwordAtLeastOneUppercase');
const passwordAtLeastOneLowercase = require('./rules/passwordAtLeastOneLowercase');
const passwordAtLeastOneSpecialCharacter = require('./rules/passwordAtLeastOneSpecialCharacter');
const passwordsCannotBeReUsed = require('./rules/passwordsCannotBeReUsed');
const passwordsMustMatch = require('./rules/passwordsMustMatch');
const currentPasswordMustMatch = require('./rules/currentPasswordMustMatch');
const readOnlyRoleCannotBeAssignedWithOtherRoles = require('./rules/read-only-role-cannot-be-assigned-with-other-roles');
const usernameAndEmailMustMatch = require('./rules/username-and-email-must-match');
const emailMustBeValidEmailAddress = require('./rules/email-must-be-valid-email-address');
const emailMustBeUnique = require('./rules/email-must-be-unique');
const getIsTrustedFieldValidationRule = require('./rules/get-is-trusted-field-validation-rule');

const {
  createTestCasesFromRules,
} = require('../../../../test-helpers/unit-test-helpers/users/validation/user-validation.test-helpers');

jest.mock('./rules/passwordAtLeast8Characters');
jest.mock('./rules/passwordAtLeastOneNumber');
jest.mock('./rules/passwordAtLeastOneUppercase');
jest.mock('./rules/passwordAtLeastOneLowercase');
jest.mock('./rules/passwordAtLeastOneSpecialCharacter');
jest.mock('./rules/passwordsCannotBeReUsed');
jest.mock('./rules/passwordsMustMatch');
jest.mock('./rules/currentPasswordMustMatch');
jest.mock('./rules/read-only-role-cannot-be-assigned-with-other-roles');
jest.mock('./rules/username-and-email-must-match');
jest.mock('./rules/email-must-be-valid-email-address');
jest.mock('./rules/email-must-be-unique');
jest.mock('./rules/get-is-trusted-field-validation-rule');
when(getIsTrustedFieldValidationRule).calledWith({ required: false }).mockReturnValue(jest.fn());

const { applyUpdateRules } = require('.');

describe('user validation', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    resetAllWhenMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('applyUpdateRules', () => {
    const baseExistingUser = {};
    const baseUpdateUserRequestWithoutCurrentPassword = {};
    const updateUserRequestWithPassword = {
      ...baseUpdateUserRequestWithoutCurrentPassword,
      currentPassword: 'currentPassword',
    };

    const testCases = [
      {
        description: 'current password is not provided',
        makeApplyRulesCall: async () =>
          await applyUpdateRules(baseExistingUser, baseUpdateUserRequestWithoutCurrentPassword),
        allRules: {
          expectedRules: {
            passwordAtLeast8Characters,
            passwordAtLeastOneNumber,
            passwordAtLeastOneUppercase,
            passwordAtLeastOneLowercase,
            passwordAtLeastOneSpecialCharacter,
            passwordsMustMatch,
            passwordsCannotBeReUsed,
            readOnlyRoleCannotBeAssignedWithOtherRoles,
            usernameAndEmailMustMatch,
            emailMustBeValidEmailAddress,
            emailMustBeUnique,
            isTrustedFieldValidation: getIsTrustedFieldValidationRule({ required: false }),
          },
          otherRules: {
            currentPasswordMustMatch,
          },
        },
        expectedArgumentsToCallRuleWith: [baseExistingUser, baseUpdateUserRequestWithoutCurrentPassword],
      },
      {
        description: 'current password is provided',
        makeApplyRulesCall: async () => await applyUpdateRules(baseExistingUser, updateUserRequestWithPassword),
        allRules: {
          expectedRules: {
            passwordAtLeast8Characters,
            passwordAtLeastOneNumber,
            passwordAtLeastOneUppercase,
            passwordAtLeastOneLowercase,
            passwordAtLeastOneSpecialCharacter,
            passwordsMustMatch,
            passwordsCannotBeReUsed,
            readOnlyRoleCannotBeAssignedWithOtherRoles,
            usernameAndEmailMustMatch,
            emailMustBeValidEmailAddress,
            emailMustBeUnique,
            currentPasswordMustMatch,
            isTrustedFieldValidation: getIsTrustedFieldValidationRule({ required: false }),
          },
          otherRules: {},
        },
        expectedArgumentsToCallRuleWith: [baseExistingUser, updateUserRequestWithPassword],
      },
    ];

    describe.each(testCases)(
      'when $description',
      ({ makeApplyRulesCall, allRules, expectedArgumentsToCallRuleWith }) => {
        const allRulesTestCases = createTestCasesFromRules({ allRules });

        whenApplyingRulesItAppliesOnlyTheExpectedRules({
          makeApplyRulesCall,
          allRulesTestCases,
          expectedArgumentsToCallRuleWith,
        });

        whenNoRulesReturnAnErrorItReturnsAnEmptyArray({ makeApplyRulesCall, allRulesTestCases });

        whenASingleRuleReturnsAnErrorItReturnsTheError({ makeApplyRulesCall, allRulesTestCases });

        whenASingleRuleThrowsAnUnhandledErrorItThrowsTheError({ makeApplyRulesCall, allRulesTestCases });

        whenMultipleRulesReturnErrorsItReturnsAllErrors({ makeApplyRulesCall, allRulesTestCases });
      },
    );
  });
});
