const { resetAllWhenMocks } = require('jest-when');
const { applyUpdateRules } = require('.');
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
const { createTestCasesFromRules } = require('../../../../test-helpers/unit-test-helpers/users/validation/user-validation.test-helpers');

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
    const baseUpdateTfmUserRequestWithoutCurrentPassword = {};
    const UpdateTfmUserRequestWithPassword = {
      ...baseUpdateTfmUserRequestWithoutCurrentPassword,
      currentPassword: 'currentPassword',
    };

    const testCases = [
      {
        description: 'current password is not provided',
        makeApplyRulesCall: async () => await applyUpdateRules(baseExistingUser, baseUpdateTfmUserRequestWithoutCurrentPassword),
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
          },
          otherRules: {
            currentPasswordMustMatch,
          },
        },
        expectedArgumentsToCallRuleWith: [baseExistingUser, baseUpdateTfmUserRequestWithoutCurrentPassword],
      },
      {
        description: 'current password is provided',
        makeApplyRulesCall: async () => await applyUpdateRules(baseExistingUser, UpdateTfmUserRequestWithPassword),
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
          },
          otherRules: {},
        },
        expectedArgumentsToCallRuleWith: [baseExistingUser, UpdateTfmUserRequestWithPassword],
      },
    ];

    describe.each(testCases)('when $description', ({ makeApplyRulesCall, allRules, expectedArgumentsToCallRuleWith }) => {
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
    });
  });
});
